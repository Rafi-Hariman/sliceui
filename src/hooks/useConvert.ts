import { useState, useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
  const queryClient = useQueryClient()

  // Monotonic request id so a newer Generate (or rapid re-click) supersedes an
  // in-flight one - stale results never overwrite current state.
  const requestIdRef = useRef(0)

  const convert = useCallback(async (
    file: File,
    framework: Framework,
    options: ConversionOptions
  ) => {
    // Defense-in-depth: /slice is route-protected, but generation itself still
    // requires an authenticated user.
    if (!user) {
      setError("You must be logged in to convert images")
      return
    }

    const myRequestId = ++requestIdRef.current

    setIsLoading(true)
    setError(null)
    setCode(null)
    setLoadingMessage("Analyzing UI layout...")

    const loadingTimer = setTimeout(() => {
      if (myRequestId === requestIdRef.current) {
        setLoadingMessage(`Generating ${framework} code...`)
      }
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

      // A newer request superseded this one - discard the result.
      if (myRequestId !== requestIdRef.current) return

      setCode(generatedCode)

      // A generation consumed quota server-side - refresh the usage indicator.
      queryClient.invalidateQueries({ queryKey: ["entitlement"] })

      // Persist to Supabase. Isolated so a storage hiccup never discards the
      // generated code that the user already sees.
      try {
        const { url: imageUrl } = await uploadSliceImage(file, user.id)
        await createConversion(
          user.id,
          imageUrl,
          file.name,
          framework,
          options,
          generatedCode
        )
      } catch (persistErr: unknown) {
        console.error("Failed to persist conversion:", persistErr)
      }
      // Either way, the conversions list (Dashboard recent + History) may have
      // changed - refresh the shared cache.
      queryClient.invalidateQueries({ queryKey: ["conversions"] })
    } catch (err: unknown) {
      if (myRequestId !== requestIdRef.current) return
      console.error("Conversion error:", err)
      const errorMessage = err instanceof Error ? err.message : "Conversion failed. Please try again."

      if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        setError("Daily limit reached. Please try again tomorrow.")
      } else if (errorMessage.includes("API key")) {
        setError("API configuration error. Please check your settings.")
      } else {
        setError(errorMessage)
      }
    } finally {
      if (myRequestId === requestIdRef.current) {
        clearTimeout(loadingTimer)
        setIsLoading(false)
      }
    }
  }, [user, queryClient])

  const reset = useCallback(() => {
    requestIdRef.current++ // invalidate any in-flight request
    setIsLoading(false)
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
