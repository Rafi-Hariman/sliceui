import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AppLayout } from "@/components/AppLayout"
import CodeOutput from "@/components/CodeOutput"
import FrameworkDropdown from "@/components/FrameworkDropdown"
import OptionsBar from "@/components/OptionsBar"
import useImageUpload from "@/hooks/useImageUpload"
import useConvert from "@/hooks/useConvert"
import type { Framework, ConversionOptions } from "@/lib/types"
import {
  Upload,
  Sparkles,
  RefreshCw,
  X,
  Image as ImageIcon,
} from "lucide-react"

const DEFAULT_OPTIONS: ConversionOptions = {
  responsive: true,
  semanticHtml: true,
  darkMode: false,
  a11y: false
}

export default function Slice() {
  const [framework, setFramework] = useState<Framework>("tailwind")
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS)
  const [prompt, setPrompt] = useState("")
  const [designSystem, setDesignSystem] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    file,
    preview,
    isDragging,
    error: uploadError,
    handleDrop,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    clearFile
  } = useImageUpload()

  const {
    code,
    isLoading,
    error: convertError,
    convert,
    reset
  } = useConvert()

  const handleGenerate = useCallback(async () => {
    if (!file) {
      toast.error("Please upload an image first")
      return
    }

    reset()
    const effectiveOptions: ConversionOptions = {
      ...options,
      designSystem: designSystem.trim() || undefined
    }
    await convert(file, framework, effectiveOptions, prompt)
  }, [file, framework, options, designSystem, prompt, convert, reset])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }, [handleGenerate])

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <AppLayout title="Slice">
      <div className="flex flex-col h-full relative">
        {/* Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-background border-2 border-dashed border-primary rounded-xl p-12 text-center">
              <ImageIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Drop your image here</p>
            </div>
          </div>
        )}

        <div
          className="flex-1 flex flex-col overflow-hidden p-4 gap-3 bg-background min-h-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* ── Top bar: image upload + prompt + generate ── */}
          <div className="shrink-0 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Image / prompt card */}
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-card border border-border rounded-2xl px-2 py-1.5 shadow-sm focus-within:border-primary/30 transition-colors">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlusClick}
                className="shrink-0 rounded-lg h-9 w-9"
                title="Upload image (PNG, JPG, WebP · max 10MB)"
              >
                {file ? (
                  <X
                    className="w-4 h-4"
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {file && preview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 flex items-center gap-2 rounded-lg border border-border hover:border-muted-foreground/40 transition-colors p-0.5 pr-2"
                  title="Replace image"
                >
                  <img
                    src={preview}
                    alt="Uploaded preview"
                    className="h-9 w-9 rounded-md object-cover border border-border"
                  />
                  <span className="text-[11px] font-medium truncate max-w-24">{file.name}</span>
                </button>
              ) : (
                <span className="shrink-0 text-[11px] text-muted-foreground hidden sm:block">
                  PNG · JPG · WebP
                </span>
              )}

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={file ? "Describe what you want, or leave blank…" : "Upload an image to start…"}
                disabled={!file}
                rows={1}
                className="min-h-[36px] max-h-24 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent px-2 text-sm"
              />

              <Button
                onClick={handleGenerate}
                disabled={!file || isLoading}
                size="sm"
                className="shrink-0 rounded-lg h-9 gap-1.5"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isLoading ? "Generating…" : "Generate"}
              </Button>
            </div>

            {/* Framework + options */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 lg:w-auto lg:justify-end">
              <FrameworkDropdown
                value={framework}
                onChange={setFramework}
                disabled={isLoading}
              />
              <OptionsBar options={options} onChange={setOptions} />
            </div>
          </div>

          {/* ── Design system (optional) ── */}
          <details className="shrink-0 group">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 select-none list-none">
              <span className="transition-transform group-open:rotate-90">›</span>
              Design system (optional)
              {designSystem.trim() && (
                <span className="text-[10px] text-primary">• set</span>
              )}
            </summary>
            <div className="mt-2">
              <Textarea
                value={designSystem}
                onChange={(e) => setDesignSystem(e.target.value)}
                placeholder="Paste your tokens — colors, fonts, spacing, or a Tailwind theme — and the output will conform to it."
                rows={3}
                className="min-h-[64px] max-h-40 resize-none text-sm"
              />
            </div>
          </details>

          {uploadError && (
            <p className="text-xs text-destructive shrink-0">{uploadError}</p>
          )}

          {/* ── Main canvas: code output / states ── */}
          <div className="flex-1 min-h-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors focus-within:border-primary/25">
            {!file && !code ? (
              // Empty state
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40 bg-primary/20" aria-hidden />
                  <div className="relative w-20 h-20 rounded-3xl border border-border bg-background flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Convert UI to Code</h2>
                  <p className="text-muted-foreground max-w-md">
                    Upload a screenshot to generate production-ready code
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {isLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground">Generating code…</p>
                    </div>
                  </div>
                )}

                {code && (
                  <div className="flex-1 p-4 min-h-0">
                    <CodeOutput
                      code={code}
                      framework={framework}
                      isLoading={false}
                    />
                  </div>
                )}

                {convertError && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-destructive mb-4">{convertError}</p>
                      <Button onClick={clearFile} variant="outline" size="sm">
                        Try again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Bottom bar: usage chart (like vibe-coding app builders) ── */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-card border border-border rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Generations</span>
            </div>
            <div className="flex-1 flex items-end h-9 gap-1 min-w-0" aria-hidden="true">
              {[38, 62, 45, 80, 56, 92, 70].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-t-sm bg-primary/15 hover:bg-primary/30 transition-colors"
                />
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
              5 / 1,500 today
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
