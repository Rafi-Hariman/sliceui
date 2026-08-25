import { useState, useCallback } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy, Download } from "lucide-react"
import { getFramework } from "@/lib/frameworks"
import type { Framework } from "@/lib/types"

// Clean theme without line backgrounds
const cleanTheme = {
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
  },
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: 'transparent',
  },
}

interface CodeOutputProps {
  code: string | null
  framework: Framework | null
  isLoading: boolean
}

type Tab = "code" | "preview"

export default function CodeOutput({ code, framework, isLoading }: CodeOutputProps) {
  const [activeTab, setActiveTab] = useState<Tab>("code")
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const handleDownload = useCallback(() => {
    if (!code || !framework) return
    const fw = getFramework(framework)
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `component.${fw.ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [code, framework])

  // Svelte excluded: svelte@5 has no practical standalone browser compiler
  // bundle (the compiler isn't shipped for browser use), so in-browser preview
  // would need a heavy dep for one framework. See phase-P3 task 8 decision.
  const canPreview = framework && ["tailwind", "bootstrap5", "native-html", "react-tsx", "vue-sfc", "nextjs"].includes(framework)
  const lineCount = code ? code.split("\n").length : 0

  // Build preview document with necessary CSS frameworks
  const getPreviewDoc = (code: string, fw: Framework) => {
    let headExtras = ""
    let bodyContent = code
    let scriptContent = ""

    if (fw === "tailwind") {
      headExtras = `
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      `
    } else if (fw === "bootstrap5") {
      headExtras = `
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      `
    } else if (fw === "react-tsx" || fw === "nextjs") {
      headExtras = `
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      `
      // Extract component code and wrap in proper structure
      const functionMatch = code.match(/export\s+default\s+function\s+(\w+)/) ||
                           code.match(/export\s+default\s+\((\w+)\)\s*=>/);
      const constMatch = code.match(/export\s+default\s+const\s+(\w+)\s*=\s*(?:\(\)|\([^)]*\))\s*=>/);

      let cleanCode = code
        .replace(/^import\s+.*$/gm, "") // Remove import statements
        .replace(/export\s+default\s+/g, "window.PreviewComponent = ")
        .replace(/export\s+/g, "")

      scriptContent = `
        try {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          ${cleanCode}
          const Component = window.PreviewComponent;
          delete window.PreviewComponent;
          root.render(React.createElement(Component || Component));
        } catch(e) {
          document.getElementById('root').innerHTML = '<p style="color:red">Preview error: ' + e.message + '<br><small>' + e.stack + '</small></p>';
        }
      `
      bodyContent = `<div id="root"></div>`
    } else if (fw === "vue-sfc") {
      headExtras = `
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      `
      // Parse Vue SFC
      const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
      const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
      const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)

      const template = templateMatch ? templateMatch[1].trim() : '<div>No template found</div>'
      const script = scriptMatch ? scriptMatch[1].trim() : ''

      scriptContent = `
        try {
          const { createApp, ref } = Vue;
          ${script}
          const app = createApp({
            template: \`${template}\`,
            setup() {
              ${script.includes('defineComponent') ? 'return {};' : ''}
            }
          });
          app.mount('#app');
        } catch(e) {
          document.getElementById('app').innerHTML = '<p style="color:red">Preview error: ' + e.message + '</p>';
        }
      `
      bodyContent = `<div id="app"></div>`
    }
    // native-html has embedded CSS

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${headExtras}
</head>
<body>
  ${bodyContent}
  ${scriptContent ? `<script type="text/babel">${scriptContent}</script>` : ''}
</body>
</html>`
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border overflow-hidden bg-muted/30 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Generating code...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`
              px-3 py-1 text-xs font-medium rounded transition-colors
              ${activeTab === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
            `}
          >
            Code
          </button>
          {canPreview && (
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`
                px-3 py-1 text-xs font-medium rounded transition-colors
                ${activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
            `}
            >
              Preview
            </button>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!code}
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!code}
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download code"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {!code ? (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-muted-foreground">
              Upload a screenshot to get started
            </p>
          </div>
        ) : activeTab === "code" ? (
          <div className="min-h-full">
            <SyntaxHighlighter
              language={framework ? getFramework(framework).lang : "html"}
              style={cleanTheme}
              customStyle={{
                borderRadius: 0,
                margin: 0,
                fontSize: "13px",
                background: "transparent",
                minHeight: "100%"
              }}
              showLineNumbers
              lineNumberStyle={{
                color: "hsl(var(--muted-foreground))",
                fontSize: "12px",
                background: "transparent",
                paddingRight: "16px",
                minWidth: "40px",
                textAlign: "right"
              }}
              lineProps={{
                style: {
                  background: "transparent"
                },
                className: "code-line"
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        ) : canPreview ? (
          <iframe
            srcDoc={getPreviewDoc(code, framework!)}
            title="Preview"
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white"
          />
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-muted-foreground">
              Preview not available for this framework
            </p>
          </div>
        )}
      </div>

      {code && framework && (
        <div className="px-3 py-1.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          {lineCount} lines · {getFramework(framework).label}
        </div>
      )}
    </div>
  )
}
