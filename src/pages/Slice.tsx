import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { AppLayout } from "@/components/AppLayout"
import CodeOutput from "@/components/CodeOutput"
import OptionsBar from "@/components/OptionsBar"
import useImageUpload from "@/hooks/useImageUpload"
import useConvert from "@/hooks/useConvert"
import { FRAMEWORKS } from "@/lib/frameworks"
import type { Framework, ConversionOptions } from "@/lib/types"
import { Plus, ArrowUp, X, Image as ImageIcon, Sun, Moon, Settings as SettingsIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const DEFAULT_OPTIONS: ConversionOptions = {
  responsive: true,
  semanticHtml: true,
  darkMode: false,
  a11y: false
}

const FRAMEWORK_ICONS: Record<string, React.ReactNode> = {
  "tailwind": <span className="font-bold text-cyan-500">TW</span>,
  "react-tsx": <span className="font-bold text-blue-500">Re</span>,
  "vue-sfc": <span className="font-bold text-green-500">Vu</span>,
  "bootstrap5": <span className="font-bold text-purple-500">BS</span>,
  "native-html": <span className="font-bold text-orange-500">HT</span>,
  "nextjs": <span className="font-bold text-gray-900 dark:font-bold">Nx</span>,
  "svelte": <span className="font-bold text-red-500">Sv</span>,
  "flutter": <span className="font-bold text-sky-500">Fl</span>,
}

export default function Slice() {
  const { profile, user } = useAuth()
  const [framework, setFramework] = useState<Framework>("tailwind")
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS)
  const [showCanvasPreview, setShowCanvasPreview] = useState(false)
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window !== "undefined") return document.documentElement.classList.contains("dark") ? "dark" : "light"
    return "dark"
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const toggleTheme = (value: string) => {
    setThemeState(value)
    if (value === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

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

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload an image first")
      return
    }

    reset()
    await convert(file, framework, options)
  }

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full relative">
        {/* Header Navbar - Like Dashboard/Settings */}
        <div className="flex items-center justify-between px-4 md:px-6 h-11 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Slice</h1>

          <div className="flex items-center gap-2">
            {/* Theme Toggle - Single Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
              className="h-7 w-7"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Avatar with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[9px] leading-none">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="end">
                <div className="p-3 border-b border-border">
                  <p className="text-[13px] font-medium">{profile?.full_name || "User"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
                <div className="p-1">
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-[12px] gap-1.5">
                      <SettingsIcon className="h-3 w-3" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-background border-2 border-dashed border-primary rounded-xl p-12 text-center">
              <ImageIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Drop your image here</p>
            </div>
          </div>
        )}

        {/* Main Content: Left Panel + Right Canvas */}
        <div
          className="flex-1 flex flex-col md:flex-row overflow-auto md:overflow-hidden p-4 gap-4 bg-sidebar min-h-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Left Panel Card - Not attached to sidebar/header */}
          <div data-testid="upload-zone" className="w-full md:w-80 md:shrink-0 bg-sidebar border border-border rounded-xl shadow-sm flex flex-col min-h-0">
            {/* Upload + Generate Bar */}
            <div className="p-3 border-b border-border">
              <div className="bg-background border border-border rounded-xl p-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlusClick}
                  className="shrink-0 rounded-full h-9 w-9"
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
                  className="flex-1 h-9 bg-primary hover:bg-primary/90"
                  title="Generate code"
                >
                  <ArrowUp className="w-4 h-4 mr-1.5" />
                  {isLoading ? "Generating..." : "Generate code"}
                </Button>
              </div>

              {uploadError && (
                <p className="text-xs text-destructive mt-2">{uploadError}</p>
              )}
            </div>

            {/* Framework Cards + Options */}
            <div className="p-3 flex-1 overflow-auto">
              <p className="text-xs text-muted-foreground mb-2 px-1">Select Framework</p>
              <div className="grid grid-cols-2 gap-2">
                {FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id as Framework)}
                    aria-pressed={framework === fw.id}
                    data-testid={`framework-${fw.id}`}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
                      ${framework === fw.id
                        ? "border-primary bg-primary/20 shadow-sm"
                        : "border-border bg-sidebar hover:border-muted-foreground/30 hover:bg-muted/20"
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-lg bg-sidebar border border-border flex items-center justify-center text-sm font-bold">
                      {FRAMEWORK_ICONS[fw.id] || fw.id.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-center leading-tight text-foreground">
                      {fw.label}
                    </span>
                  </button>
                ))}
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
                  className="w-full flex items-center gap-2 p-2 rounded-lg border border-border hover:border-muted-foreground/30 hover:bg-muted/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                    <img src={preview} alt="Preview" data-testid="image-preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[11px] font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.size > 1024 * 1024
                        ? `${(file.size / 1024 / 1024).toFixed(1)}MB`
                        : `${(file.size / 1024).toFixed(0)}KB`}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {showCanvasPreview ? "Hide" : "Preview"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Canvas: Code Output */}
          <div className="flex-1 min-h-[420px] md:min-h-0 bg-sidebar border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            {!file && !code ? (
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
                {showCanvasPreview && file && preview && !code && !isLoading && (
                  // Image Preview in Canvas
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Image Preview</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCanvasPreview(false)}
                        className="h-6 text-[11px]"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Close
                      </Button>
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden bg-background">
                      <img src={preview} alt="Preview" className="w-full" />
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4" data-testid="loading-state">
                      <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground">Generating code...</p>
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
                    <div className="text-center" data-testid="error-message">
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
        </div>
      </div>
    </AppLayout>
  )
}
