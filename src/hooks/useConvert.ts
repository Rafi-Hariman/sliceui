import { useState, useCallback } from "react"
import { imageToCode } from "@/lib/aiService"
import { uploadSliceImage } from "@/lib/storageService"
import { createConversion } from "@/lib/conversionService"
import { isSupabaseConfigured } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { Framework, ConversionOptions } from "@/lib/types"

interface UseConvertReturn {
  convert: (file: File, framework: Framework, options: ConversionOptions, instructions?: string) => Promise<void>
  code: string | null
  setCode: (code: string | null) => void
  isLoading: boolean
  loadingMessage: string
  error: string | null
  reset: () => void
}

export default function useConvert(): UseConvertReturn {
  const [code, setCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const convert = useCallback(async (
    file: File,
    framework: Framework,
    options: ConversionOptions,
    instructions?: string
  ) => {
    setIsLoading(true)
    setError(null)
    setCode(null)
    setLoadingMessage("Analyzing UI layout...")

    const loadingTimer = setTimeout(() => {
      setLoadingMessage(`Generating ${framework} code...`)
    }, 1800)

    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(",")[1]
          resolve(base64)
        }
      })
      reader.readAsDataURL(file)

      const base64 = await base64Promise
      const mimeType = file.type || "image/png"
      const generatedCode = await imageToCode(base64, framework, options, instructions, mimeType)

      setCode(generatedCode)

      // Persist to Supabase only when there's a logged-in user AND Supabase
      // is configured. Without a session (or in bypass mode / no project) the
      // conversion is generated + shown but not saved to history.
      if (user && isSupabaseConfigured()) {
        const { url: imageUrl } = await uploadSliceImage(file, user.id)

        await createConversion(
          user.id,
          imageUrl,
          file.name,
          framework,
          options,
          generatedCode
        )
      }
    } catch (err: any) {
      console.error("Conversion error:", err)
      const errorMessage = err?.message || "Conversion failed. Please try again."

      if (errorMessage.includes("timed out")) {
        setError(
          "Generation timed out. The image may be too large or the AI service is slow — try again or use a smaller image."
        )
      } else if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        setError("Daily limit reached. Please try again tomorrow.")
      } else if (errorMessage.includes("API key")) {
        setError("API configuration error. Please check your settings.")
      } else {
        setError(errorMessage)
      }
    } finally {
      clearTimeout(loadingTimer)
      setIsLoading(false)
    }
  }, [user])

  const reset = useCallback(() => {
    setCode(null)
    setError(null)
    setLoadingMessage("")
  }, [])

  return {
    convert,
    code,
    setCode,
    isLoading,
    loadingMessage,
    error,
    reset
  }
}
