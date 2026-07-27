# Product Requirements Document (PRD) - SliceUI

## 1. Description

SliceUI is a screenshot-to-component tool: paste/upload a UI screenshot, choose
a target frontend framework, and receive a self-contained, production-leaning
component you can drop into an existing project. It is **not** a full-app
scaffold generator.

## 2. Important

- Output is always a **single self-contained component** - never `html`/`body`/
  `main` entry points, never a full app.
- The generator is instructed to use the **exact text** visible in the image as
  placeholder content, match **hex colors** from the image, and represent images
  and icons as placeholders (gray divs / `/* icon: ... */` comments).
- This PRD reflects the **implemented behavior** (Inferred from codebase).
  `CLAUDE.md` contains an older/aspirational scope (server-side Next.js, rate
  limiting) that is tracked in `foundation/status.md`, not here.

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Vision Statement](#vision-statement)
- [Target Personas](#target-personas)
- [Core Business Value](#core-business-value)
- [User Journeys & App Flow](#user-journeys--app-flow)
- [Feature Workflows](#feature-workflows)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Acceptance Criteria](#acceptance-criteria)
- [External Dependencies & Partners](#external-dependencies--partners)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

In scope: web app that ingests a UI image, calls a vision LLM, and returns +
renders framework-specific component code with copy/download/live-preview, plus
optional auth and conversion history.

Out of scope: see [Non Goals](#6-non-goals).

## 5. Goals

- Turn a screenshot into paste-ready component code in seconds.
- Support multiple target frameworks from one screenshot.
- Let the user verify output instantly via an in-app live preview.
- Persist a user's conversion history when authenticated.

## 6. Non Goals

- Generating a complete application scaffold (routing, build config, etc.).
- Pixel-perfect 1:1 reproduction guarantees.
- Figma plugin / design-URL ingestion.
- Streaming output, multi-image, or full-page slicing.
- A backend owned by SliceUI (the app uses third-party AI APIs + Supabase;
  there is no SliceUI server today).

## Vision Statement

Give frontend engineers a 10-second jump-start on any new UI slice by converting
a screenshot into idiomatic, framework-correct component code they can paste and
iterate on immediately.

## Target Personas

- **Frontend engineer (primary):** mid/senior, works across frameworks, wants a
  fast starting point rather than hand-authoring boilerplate from a design.
- **Indie/full-stack builder:** ships features across stacks; values preview +
  copy to validate output before integrating.

## Core Business Value

Compress the "stare at the design, scaffold the markup" step of feature
delivery into a single upload-and-generate action.

## User Journeys & App Flow

1. Land on `/` (marketing/index) → click into the product.
2. (Optional) Sign in at `/auth` to enable history persistence.
3. On `/slice`: upload image (drag-drop / click / **Ctrl+V paste**) → choose
   framework → toggle options → **Generate**.
4. Loading states: "Analyzing UI layout..." → "Generating {framework} code...".
5. View result: **Code** tab (syntax-highlighted) or **Preview** tab (live
   iframe). Copy or download `component.<ext>`.
6. (If signed in) conversion is stored; visible in `/dashboard`.

## Feature Workflows

- **Conversion pipeline:** `useConvert` → `imageToCode` (Gemini; Groq fallback on
  429/quota) → `clean()` strips code fences → set code. If `user`, also
  `uploadSliceImage` + `createConversion`.
- **Image intake:** `useImageUpload` validates type/size (PNG/JPG/WebP, ≤10MB),
  builds an object-URL preview, and listens for clipboard paste globally.
- **Output rendering:** `CodeOutput` highlights code, builds a sandboxed
  `srcDoc` preview per framework, and provides copy/download.

## Functional Requirements

- **FR-1** Accept image input via drag-drop, file picker, and clipboard paste.
- **FR-2** Validate image: types PNG/JPEG/WebP; max 10 MB.
- **FR-3** Convert image to base64 and send to a vision LLM with a
  framework-specific prompt.
- **FR-4** Support target frameworks: Tailwind, React TSX, Vue 3 SFC, Bootstrap
  5, HTML+CSS, Next.js, Svelte 5. (Flutter type exists but is not surfaced in the
  picker - see Open Questions.)
- **FR-5** Options: responsive, semantic HTML, dark mode, a11y - injected into
  the prompt when enabled.
- **FR-6** Automatic provider fallback Gemini → Groq on rate-limit/quota errors.
- **FR-7** Display generated code with syntax highlighting; show line count.
- **FR-8** Copy to clipboard and download as `component.<ext>`.
- **FR-9** Live preview in a sandboxed iframe for supported frameworks.
- **FR-10** Auth (email/password) and conversion history when signed in.
- **FR-11** Theming (dark default) via `next-themes`.

## Non-Functional Requirements

- **NFR-1 Latency:** end-to-end generate within typical vision-LLM response time
  (single multimodal call; no multi-stage orchestration).
- **NFR-2 Cost:** rely on free tiers (Gemini + Groq). TBD hard quotas.
- **NFR-3 Resilience:** degrade gracefully on provider rate-limit with fallback
  + user-facing messages.
- **NFR-4 Security:** minimize key exposure (currently client-side - see risks).
- **NFR-5 A11y:** UI built on accessible Radix primitives; generated code can
  include a11y attributes on demand.

## Acceptance Criteria

- AC: uploading a PNG and selecting React TSX returns a valid TSX component
  whose first line is `// Generated by SliceUI`, with no markdown fences.
- AC: when Gemini returns 429 and a Groq key is set, output is still produced.
- AC: copy button writes the exact generated code to the clipboard.
- AC: for a signed-in user, the conversion appears in `/dashboard` history.

## External Dependencies & Partners

- **Google Gemini** - primary vision + codegen model (`gemini-flash-latest`).
- **Groq** - fallback vision model (`pixtral-12b-2409`).
- **Supabase** - auth, Postgres (`conversions`, `profiles`), Storage bucket.
- **Lovable** - origin of the project scaffold (`@lovable.dev/cloud-auth-js`,
  `lovable-tagger` dev plugin).

## Success Metrics

- Successful conversion rate (non-error responses) per session.
- Time from upload to first code render.
- Share of users who copy or download generated code.
- Fallback-to-Groq rate (proxy for Gemini saturation).

## Related Documents

- [architecture.md](./architecture.md) - how the pipeline is wired.
- [api-contract.md](../development/api-contract.md) - provider contracts.
- [status.md](./status.md) - what is implemented vs. planned.

## Open Questions

- Should `flutter` be added to the framework picker (it is in the `Framework`
  type union but absent from `FRAMEWORKS`)?
- Is guest-mode generation (login guard disabled) intended for production or
  local-dev only?
- Confirm the intended long-term architecture: keep client-side AI calls, or
  move to the server-side design in `CLAUDE.md`?
