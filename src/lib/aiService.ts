import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"
import { buildPrompt } from "./prompts"
import { supabase } from "@/integrations/supabase/client"
import type { Framework, ConversionOptions } from "./types"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
// When set, generation goes through the metered edge function (Phase 0) instead
// of client-side SDK calls. Leave unset for local dev (client-side Gemini/Groq).
const PROXY_URL = import.meta.env.VITE_CONVERT_PROXY_URL

const gemini = new GoogleGenerativeAI(GEMINI_API_KEY || "")
const groq = new Groq({
  apiKey: GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true // We're using client-side API keys (dev only)
})

export async function imageToCode(
  base64Image: string,
  framework: Framework,
  options: ConversionOptions
): Promise<string> {
  if (PROXY_URL) {
    return imageToCodeViaProxy(PROXY_URL, base64Image, framework, options)
  }

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  try {
    return await callGemini(base64Image, framework, options)
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    const isRateLimit =
      error?.status === 429 ||
      error?.message?.includes("quota") ||
      error?.message?.includes("rate") ||
      error?.message?.includes("limit")

    if (isRateLimit && GROQ_API_KEY) {
      console.warn("Gemini rate limit hit, switching to Groq")
      return await callGroq(base64Image, framework, options)
    }
    throw err
  }
}

/**
 * Calls the metered /convert edge function with the user's session token.
 * The function hides AI keys, checks entitlement (free/pro), routes to the
 * right model, and logs usage. Throws with a user-safe message on failure.
 */
async function imageToCodeViaProxy(
  proxyUrl: string,
  base64Image: string,
  framework: Framework,
  options: ConversionOptions
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error("You must be logged in to convert images")

  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: base64Image, framework, options }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Conversion failed. Please try again.")
  }
  if (typeof data.code !== "string") {
    throw new Error("The server returned an unexpected response. Please try again.")
  }
  return data.code as string
}

async function callGemini(
  base64: string,
  framework: Framework,
  options: ConversionOptions
): Promise<string> {
  const model = gemini.getGenerativeModel({ model: "gemini-flash-latest" })
  const prompt = buildPrompt(framework, options)

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/png", data: base64 } }
  ])

  return clean(result.response.text())
}

async function callGroq(
  base64: string,
  framework: Framework,
  options: ConversionOptions
): Promise<string> {
  const prompt = buildPrompt(framework, options)

  const res = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/png;base64,${base64}` }
          }
        ]
      }
    ],
    max_tokens: 4096
  })

  return clean(res.choices[0].message.content ?? "")
}

export function clean(raw: string): string {
  return raw
    .replace(/^```[\w-]*\n?/m, "")
    .replace(/```\s*$/m, "")
    .trim()
}
