import {
  GoogleGenerativeAI,
  GoogleGenerativeAIAbortError,
  type SingleRequestOptions
} from "@google/generative-ai"
import Groq from "groq-sdk"
import { buildPrompt } from "./prompts"
import type { Framework, ConversionOptions } from "./types"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

// In production the AI call routes through the Vercel serverless proxy
// (api/convert.ts) so keys stay server-side (ADR-001 resolution). Local dev
// keeps calling the provider directly with VITE_* keys.
const IS_PROD = import.meta.env.PROD

// Vercel Hobby caps serverless functions at 60s; mirror that client-side so
// the caller sees a clean timeout instead of a truncated upstream response.
const PROXY_TIMEOUT_MS = 55_000

// Gemini vision on a large screenshot can legitimately take 30-90s.
// Without an explicit timeout the SDK never aborts a hung fetch, so the
// request can spin forever — cap it and surface a friendly error instead.
const GEMINI_REQUEST_TIMEOUT_MS = 90_000

const gemini = new GoogleGenerativeAI(GEMINI_API_KEY || "")
const groq = new Groq({
  apiKey: GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true // We're using client-side API keys
})

export async function imageToCode(
  base64Image: string,
  framework: Framework,
  options: ConversionOptions,
  instructions?: string,
  mimeType: string = "image/png"
): Promise<string> {
  if (IS_PROD) {
    return callProxy(base64Image, framework, options, instructions, mimeType)
  }

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  try {
    return await callGemini(base64Image, framework, options, instructions, mimeType)
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    const isRateLimit =
      error?.status === 429 ||
      error?.message?.includes("quota") ||
      error?.message?.includes("rate") ||
      error?.message?.includes("limit")

    if (isRateLimit && GROQ_API_KEY) {
      console.warn("Gemini rate limit hit, switching to Groq")
      return await callGroq(base64Image, framework, options, instructions, mimeType)
    }
    throw err
  }
}

// Call the Vercel serverless proxy so the AI key never reaches the browser.
async function callProxy(
  base64Image: string,
  framework: Framework,
  options: ConversionOptions,
  instructions?: string,
  mimeType: string = "image/png"
): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS)

  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, framework, options, instructions, mimeType }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error || `Request failed (${response.status})`)
    }

    const data = (await response.json()) as { code?: string }
    if (!data.code) {
      throw new Error("AI returned no code")
    }
    return data.code
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Generation timed out. The image may be too large or the AI service is slow — try again or use a smaller image."
      )
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function callGemini(
  base64: string,
  framework: Framework,
  options: ConversionOptions,
  instructions?: string,
  mimeType: string = "image/png"
): Promise<string> {
  const model = gemini.getGenerativeModel({ model: "gemini-flash-latest" })
  const prompt = buildPrompt(framework, options, instructions)

  const requestOptions: SingleRequestOptions = {
    timeout: GEMINI_REQUEST_TIMEOUT_MS,
    signal: new AbortController().signal // caller-side signal; SDK aborts its own fetch on abort
  }

  try {
    const result = await model.generateContent(
      [
        prompt,
        { inlineData: { mimeType, data: base64 } }
      ],
      requestOptions
    )
    return clean(result.response.text())
  } catch (err: unknown) {
    if (err instanceof GoogleGenerativeAIAbortError) {
      throw new Error(
        "Generation timed out. The image may be too large or the AI service is slow — try again or use a smaller image."
      )
    }
    throw err
  }
}

async function callGroq(
  base64: string,
  framework: Framework,
  options: ConversionOptions,
  instructions?: string,
  mimeType: string = "image/png"
): Promise<string> {
  const prompt = buildPrompt(framework, options, instructions)

  const res = await groq.chat.completions.create(
    {
      model: "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` }
            }
          ]
        }
      ],
      max_tokens: 4096
    },
    {
      timeout: GEMINI_REQUEST_TIMEOUT_MS,
      signal: new AbortController().signal
    }
  )

  return clean(res.choices[0].message.content ?? "")
}

function clean(raw: string): string {
  return raw
    .replace(/^```[\w-]*\n?/m, "")
    .replace(/```\s*$/m, "")
    .trim()
}
