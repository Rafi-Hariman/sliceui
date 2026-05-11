import { useState, useCallback } from "react"
import { imageToCode } from "@/lib/aiService"
import { uploadSliceImage } from "@/lib/storageService"
import { createConversion } from "@/lib/conversionService"
import { useAuth } from "@/contexts/AuthContext"
import type { Framework, ConversionOptions } from "@/lib/types"

interface UseConvertReturn {
  convert: (file: File, framework: Framework, options: ConversionOptions) => Promise<void>
  code: string | null
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
    options: ConversionOptions
  ) => {
    if (!user) {
      setError("You must be logged in to convert images")
      return
    }

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
      const generatedCode = await imageToCode(base64, framework, options)

      setCode(generatedCode)

      const { url: imageUrl } = await uploadSliceImage(file, user.id)

      await createConversion(
        user.id,
        imageUrl,
        file.name,
        framework,
        options,
        generatedCode
      )
    } catch (err: any) {
      console.error("Conversion error:", err)
      const errorMessage = err?.message || "Conversion failed. Please try again."

      if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
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
    isLoading,
    loadingMessage,
    error,
    reset
  }
}
