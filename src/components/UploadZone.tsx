import { useRef } from "react"
import { Upload, X } from "lucide-react"

interface UploadZoneProps {
  file: File | null
  preview: string | null
  isDragging: boolean
  error: string | null
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onClear: () => void
}

export default function UploadZone({
  file,
  preview,
  isDragging,
  error,
  onDrop,
  onFileChange,
  onDragOver,
  onDragLeave,
  onClear
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={onFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Drop your UI screenshot here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or click to browse · PNG, JPG, WebP · max 10MB
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Ctrl+V to paste from clipboard
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 px-2">
          {error}
        </p>
      )}
    </div>
  )
}
