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

  const canPreview = framework && ["tailwind", "bootstrap5", "native-html", "react-tsx", "vue-sfc", "nextjs", "svelte"].includes(framework)
  const lineCount = code ? code.split("\n").length : 0

  // Build preview document with necessary CSS frameworks
  const getPreviewDoc = (code: string, fw: Framework) => {
    let headExtras = ""
    let bodyContent = code
    let scriptContent = ""
    let useBabel = false // Only for React/Next.js

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
      useBabel = true
      headExtras = `
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      `

      // Remove 'use client' directive from Next.js
      let cleanCode = code
        .replace(/^'use client';?\s*$/gm, "")
        .replace(/^"use client";?\s*$/gm, "")

      // Remove imports (keep component code intact)
      cleanCode = cleanCode.replace(/^import\s+.*$/gm, "")

      // Transform export default to window assignment
      cleanCode = cleanCode.replace(/export\s+default\s+/g, "window.__Component = ")

      scriptContent = `
        try {
          const root = ReactDOM.createRoot(document.getElementById('root'));
          ${cleanCode}
          const Component = window.__Component;
          delete window.__Component;

          if (typeof Component === 'function') {
            root.render(React.createElement(Component));
          } else {
            document.getElementById('root').innerHTML = '<p style="color:red; padding:2rem;">Error: Component is not a function. Check the generated code.</p>';
          }
        } catch(e) {
          document.getElementById('root').innerHTML =
            '<p style="color:red; padding:2rem;">Preview error: ' + e.message +
            '<br><small style="color:#666;">' + e.stack + '</small></p>';
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

      // Extract template and script sections (both optional)
      const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
      const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)

      const template = templateMatch ? templateMatch[1].trim() : '<div>No template found</div>'
      const script = scriptMatch ? scriptMatch[1].trim() : ''

      // Check for script setup
      const isScriptSetup = scriptMatch?.[0]?.includes('setup')

      scriptContent = `
        try {
          const { createApp, ref, computed, onMounted } = Vue;

          // Execute script content (if exists)
          let props = {};
          ${isScriptSetup ? script : ''}
          ${!isScriptSetup && script ? `
            // Handle regular script export default
            ${script}
          ` : ''}

          const app = createApp({
            template: \`${template.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
            setup() {
              return ${isScriptSetup ? '{}' : 'props || {}'};
            }
          });

          app.mount('#app');
        } catch(e) {
          document.getElementById('app').innerHTML =
            '<p style="color:red; padding:2rem;">Preview error: ' + e.message + '</p>';
        }
      `
      bodyContent = `<div id="app"></div>`
    } else if (fw === "svelte") {
      headExtras = `
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #fafafa;
          }
          .svelte-info {
            max-width: 600px;
            margin: 3rem auto;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }
          .svelte-info h3 {
            color: #ff3e00;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }
          .svelte-info p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .svelte-info code {
            background: #f5f5f5;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
          }
          .svelte-info .setup-box {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: #f8f8f8;
            border-radius: 8px;
            text-align: left;
            font-size: 0.9rem;
            border-left: 4px solid #ff3e00;
          }
          .svelte-info .setup-box strong {
            display: block;
            margin-bottom: 0.75rem;
            color: #333;
          }
          .svelte-info .setup-box ol {
            margin: 0;
            padding-left: 1.5rem;
          }
          .svelte-info .setup-box li {
            margin-bottom: 0.5rem;
            color: #555;
          }
        </style>
      `
      bodyContent = `
        <div class="svelte-info">
          <h3>🔴 Svelte Preview</h3>
          <p>Svelte components require compilation and cannot be previewed directly in the browser.</p>
          <p style="font-size: 0.95rem;">Copy the code and run it in a Svelte project with the Svelte compiler.</p>
          <div class="setup-box">
            <strong>Quick setup:</strong>
            <ol>
              <li>Create a new Svelte project: <code>npm create svelte@latest</code></li>
              <li>Paste this component in <code>src/routes/+page.svelte</code></li>
              <li>Run: <code>npm run dev</code></li>
            </ol>
          </div>
        </div>
      `
    } else if (fw === "native-html") {
      // Generated native-html includes its own <style> block - render as-is.
      bodyContent = code
    } else {
      // Unknown framework - show message
      headExtras = `
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #fafafa;
            padding: 2rem;
          }
          .no-preview {
            max-width: 500px;
            margin: 3rem auto;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
          }
          .no-preview h3 {
            color: #666;
            margin-bottom: 1rem;
          }
          .no-preview p {
            color: #888;
            line-height: 1.6;
          }
          .no-preview code {
            background: #f5f5f5;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
          }
        </style>
      `
      bodyContent = `
        <div class="no-preview">
          <h3>Preview Not Available</h3>
          <p>The framework <code>"${fw}"</code> does not support browser preview.</p>
          <p style="margin-top: 1rem;">Copy the code and run it in a proper project setup.</p>
        </div>
      `
    }

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
  ${scriptContent ? `<script${useBabel ? ' type="text/babel"' : ''}>${scriptContent}</script>` : ''}
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
    <div data-testid="code-output" className="rounded-lg border border-border overflow-hidden bg-card h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "code"}
            data-testid="code-tab"
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
              role="tab"
              aria-selected={activeTab === "preview"}
              data-testid="preview-tab"
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
            data-testid="copy-button"
            onClick={handleCopy}
            disabled={!code}
            aria-label="Copy code"
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!code}
            aria-label="Download code"
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="inline-block min-w-full max-w-full">
            <SyntaxHighlighter
              language={framework ? getFramework(framework).lang : "html"}
              style={cleanTheme}
              customStyle={{
                borderRadius: 0,
                margin: 0,
                fontSize: "13px",
                background: "transparent",
                minWidth: "100%",
                width: "fit-content"
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
            data-testid="preview-iframe"
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
