import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"
import { buildPrompt } from "./prompts"
import type { Framework, ConversionOptions } from "./types"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const gemini = new GoogleGenerativeAI(GEMINI_API_KEY || "")
const groq = new Groq({
  apiKey: GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true // We're using client-side API keys
})

export async function imageToCode(
  base64Image: string,
  framework: Framework,
  options: ConversionOptions
): Promise<string> {
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
    model: "pixtral-12b-2409",
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

function clean(raw: string): string {
  return raw
    .replace(/^```[\w-]*\n?/m, "")
    .replace(/```\s*$/m, "")
    .trim()
}
