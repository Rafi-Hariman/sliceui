import { useState, useCallback, useEffect, useRef } from "react"

interface UseImageUploadReturn {
  file: File | null
  preview: string | null
  isDragging: boolean
  error: string | null
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragLeave: () => void
  clearFile: () => void
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function useImageUpload(): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<string | null>(null)

  const validateFile = (f: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return { valid: false, error: "Invalid file type. Please upload PNG, JPG, or WebP." }
    }
    if (f.size > MAX_SIZE) {
      return { valid: false, error: "File too large. Maximum size is 10MB." }
    }
    return { valid: true }
  }

  const processFile = useCallback((f: File) => {
    const check = validateFile(f)
    if (!check.valid) {
      setError(check.error || "Invalid file")
      return
    }

    setError(null)
    setFile(f)

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
    }

    const url = URL.createObjectURL(f)
    previewRef.current = url
    setPreview(url)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [processFile])

  const clearFile = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    setFile(null)
    setPreview(null)
    setError(null)
  }, [])

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            processFile(new File([file], "paste.png", { type: file.type }))
            break
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [processFile])

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  return {
    file,
    preview,
    isDragging,
    error,
    handleDrop,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    clearFile
  }
}
