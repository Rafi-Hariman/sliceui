import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AppLayout } from "@/components/AppLayout"
import { AppHeader } from "@/components/AppHeader"
import CodeOutput from "@/components/CodeOutput"
import OptionsBar from "@/components/OptionsBar"
import useImageUpload from "@/hooks/useImageUpload"
import useConvert from "@/hooks/useConvert"
import { FRAMEWORKS } from "@/lib/frameworks"
import { getConversionById } from "@/lib/conversionService"
import type { Framework, ConversionOptions, Conversion } from "@/lib/types"
import { Plus, ArrowUp, X, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const DEFAULT_OPTIONS: ConversionOptions = {
  responsive: true,
  semanticHtml: true,
  darkMode: false,
  a11y: false
}

// Two-letter glyph per framework. Single accent color.
const FRAMEWORK_GLYPH: Record<string, string> = {
  "tailwind": "TW",
  "react-tsx": "Re",
  "vue-sfc": "Vu",
  "bootstrap5": "BS",
  "native-html": "HT",
  "nextjs": "Nx",
  "svelte": "Sv",
}

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export default function Slice() {
  const { user } = useAuth()
  const [framework, setFramework] = useState<Framework>("tailwind")
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS)
  const [showCanvasPreview, setShowCanvasPreview] = useState(false)
  const [loaded, setLoaded] = useState<Conversion | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reranRef = useRef<string | null>(null)
  const [params] = useSearchParams()

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
    loadingMessage,
    error: convertError,
    convert,
    reset
  } = useConvert()

  // P0-2: deep-link - /slice?conversion=<id> loads a past conversion.
  // C1: &rerun=1 re-runs it against the current model. reranRef guards against
  // double-fire across re-renders.
  useEffect(() => {
    const id = params.get("conversion")
    const rerun = params.get("rerun") === "1"
    if (!id || !user) return

    getConversionById(id)
      .then(async (c) => {
        if (!c) return
        if (rerun) {
          if (reranRef.current === id) return
          reranRef.current = id
          setLoaded(null)
          reset()
          try {
            const res = await fetch(c.original_image_url)
            const blob = await res.blob()
            const file = new File([blob], c.original_image_name, {
              type: blob.type || "image/png",
            })
            await convert(file, c.framework as Framework, c.options)
          } catch {
            /* ignore - user can still generate manually */
          }
        } else {
          setLoaded(c)
        }
      })
      .catch(() => { /* ignore - user can still upload fresh */ })
  }, [params, user, convert, reset])

  const effectiveFramework: Framework = loaded?.framework as Framework ?? framework
  const effectiveCode: string | null = loaded?.generated_code ?? code
  const effectivePreview: string | null = loaded?.original_image_url ?? preview

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload an image first")
      return
    }
    setLoaded(null) // clear any deep-linked conversion before a fresh generate
    reset()
    await convert(file, framework, options)
  }

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        <AppHeader title="Slice" />

        {/* Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 bg-primary/10 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-background border-2 border-dashed border-primary rounded-xl p-12 text-center">
              <ImageIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Drop your image here</p>
            </div>
          </div>
        )}

        {/* Main Content: Left Panel + Right Canvas */}
        <div
          className="flex-1 flex flex-col md:flex-row overflow-auto md:overflow-hidden p-5 md:p-6 gap-5 bg-background min-h-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Left Panel Card - Not attached to sidebar/header */}
          <div data-testid="upload-zone" className="w-full md:w-80 md:shrink-0 bg-card border border-border rounded-xl shadow-elev-1 flex flex-col min-h-0">
            {/* Upload + Generate Bar */}
            <div className="p-3 border-b border-border">
              <div className="bg-background border border-border rounded-xl p-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlusClick}
                  className={`shrink-0 rounded-full h-9 w-9 ${FOCUS_RING}`}
                  aria-label={file ? "Remove image" : "Upload image"}
                  title={file ? "Remove image" : "Upload image"}
                >
                  {file ? <X className="w-4 h-4" onClick={(e) => { e.stopPropagation(); clearFile(); }} /> : <Plus className="w-4 h-4" />}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <Button
                  onClick={handleGenerate}
                  disabled={!file || isLoading}
                  data-testid="generate-button"
                  className={`flex-1 h-9 bg-primary hover:bg-primary/90 hover:shadow-elev-2 transition-all ${FOCUS_RING}`}
                  aria-label="Generate code"
                  title="Generate code"
                >
                  <ArrowUp className="w-4 h-4 mr-1.5" />
                  {isLoading ? "Generating..." : "Generate code"}
                </Button>
              </div>

              {uploadError && (
                <p className="text-xs text-destructive mt-2" role="alert">{uploadError}</p>
              )}
            </div>

            {/* Framework Cards + Options */}
            <div className="p-3 flex-1 overflow-auto">
              <p className="text-xs text-muted-foreground mb-2 px-1">Select Framework</p>
              <div className="grid grid-cols-2 gap-2">
                {FRAMEWORKS.map((fw) => {
                  const selected = effectiveFramework === fw.id
                  return (
                    <button
                      key={fw.id}
                      onClick={() => { setFramework(fw.id as Framework); setLoaded(null) }}
                      aria-pressed={selected}
                      data-testid={`framework-${fw.id}`}
                      className={`
                        flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${FOCUS_RING}
                        ${selected
                          ? "border-primary bg-primary/12 shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.5)]"
                          : "border-border bg-sidebar hover:border-muted-foreground/40 hover:bg-muted/30"
                        }
                      `}
                    >
                      <div className="w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center text-sm font-bold text-primary">
                        {FRAMEWORK_GLYPH[fw.id] || fw.id.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-center leading-tight text-foreground">
                        {fw.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Options */}
              <div className="mt-4">
                <OptionsBar options={options} onChange={setOptions} />
              </div>
            </div>

            {/* Image Thumbnail - Bottom of Left Panel */}
            {file && preview && (
              <div className="p-3 border-t border-border shrink-0">
                <button
                  onClick={() => setShowCanvasPreview(!showCanvasPreview)}
                  aria-label={`${file.name}: ${showCanvasPreview ? "hide" : "show"} preview`}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border border-border hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors ${FOCUS_RING}`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                    <img src={preview} alt="Upload preview" data-testid="image-preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {file.size > 1024 * 1024
                        ? `${(file.size / 1024 / 1024).toFixed(1)}MB`
                        : `${(file.size / 1024).toFixed(0)}KB`}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {showCanvasPreview ? "Hide" : "Preview"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Canvas: Code Output */}
          <div className="flex-1 min-h-[420px] md:min-h-0 bg-card border border-border rounded-xl shadow-elev-1 overflow-hidden flex flex-col">
            {!file && !effectiveCode ? (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Convert UI to Code</h2>
                  <p className="text-muted-foreground max-w-md">
                    Upload a screenshot to generate production-ready code
                  </p>
                </div>
              </div>
            ) : (
              // Content Display
              <div className="h-full flex flex-col">
                {showCanvasPreview && file && preview && !effectiveCode && !isLoading && (
                  // Image Preview in Canvas
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Image Preview</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCanvasPreview(false)}
                        className="h-7 text-xs"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Close
                      </Button>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden bg-background">
                      <img src={preview} alt="Upload preview" className="w-full" />
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4" data-testid="loading-state">
                      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground">{loadingMessage || "Generating code..."}</p>
                      <div className="mx-auto max-w-md space-y-2" aria-hidden="true">
                        <div className="h-3 w-3/4 rounded-full bg-muted" />
                        <div className="h-3 w-full rounded-full bg-muted" />
                        <div className="h-3 w-5/6 rounded-full bg-muted" />
                      </div>
                    </div>
                  </div>
                )}

                {effectiveCode && !isLoading && (
                  <div className="flex-1 p-4 min-h-0">
                    <CodeOutput
                      code={effectiveCode}
                      framework={effectiveFramework}
                      isLoading={false}
                    />
                  </div>
                )}

                {convertError && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center" data-testid="error-message" role="alert">
                      <p className="text-sm text-destructive mb-4">{convertError}</p>
                      <Button onClick={handleGenerate} disabled={!file || isLoading} variant="outline" size="sm">
                        Try again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
