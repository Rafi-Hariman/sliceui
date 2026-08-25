# Changelog — SliceUI

## 1. Description
Historical release and change tracking for SliceUI, following the Keep a Changelog format.

## 2. Important
- **No tagged releases exist yet.** All changes to date are tracked under `[Unreleased]`.
- Entries are derived from git history (`git log`) and codebase inspection; dates reflect last-known commit activity.
- **Persistence is unprovisioned (confirmed 2026-08-24):** the `conversions` table and `sliceui-images` bucket do not exist in generated types or committed migrations — the persistence layer is intent only.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Unreleased](#7-unreleased)
- [8. Success Metrics](#8-success-metrics)
- [9. Related Documents](#9-related-documents)
- [10. Open Questions](#10-open-questions)

## 4. Scope
Tracks user- and developer-visible changes to the SliceUI app over time.

## 5. Goals
Maintain a readable history of Added/Changed/Deprecated/Removed/Fixed/Security entries so releases are auditable.

## 6. Non Goals
Does not document internal code details not visible at the feature level (see commit history for that).

## 7. Unreleased

### Added
- Vite + React 18 SPA scaffold (Lovable) with react-router, shadcn/ui, Tailwind, next-themes.
- AI-powered image-to-code conversion with Gemini (primary) and Groq (fallback) — `feat: add AI-powered image-to-code conversion service` (`c52383a`).
- Prompt builder for UI screenshot analysis and framework-specific generation rules — `feat: enhance prompt for UI screenshot analysis and component generation rules` (`d4246cc`).
- Image upload (drag-drop, file picker, clipboard paste) with validation (PNG/JPG/WebP ≤10MB).
- 7 framework outputs in the picker (Tailwind, React TSX, Vue 3, Bootstrap 5, HTML+CSS, Next.js, Svelte 5).
- Supabase integration: auth (email/password), `profiles`, `conversions` persistence, `sliceui-images` storage.
- Dark/light theme toggle with localStorage persistence.
- Syntax-highlighted code output (`CodeOutput`).

### Changed
- Conversion pipeline evolved from a (documented) Next.js API-route design to a fully client-side SPA flow.
- **Auth:** added `VITE_BYPASS_AUTH` mock mode (`AuthContext`) to enable local dev without a live Supabase project (2026-08-24).

### Deprecated
- None.

### Removed
- None.

### Fixed
- None tracked yet.

### Known gap (not yet fixed)
- `conversions` table and `sliceui-images` bucket referenced by `conversionService`/`storageService` are **not provisioned** — persistence, Dashboard history, and delete are blocked (Phase P2).

### Security
- **Live API keys are present in committed files** (root `CLAUDE.md`, and `.env` is modified/untracked). These must be rotated and removed from source control before any public release. See `operations/security-compliance.md`.

## 8. Success Metrics
Every user-visible change lands in this file, and each release is tagged.

## 9. Related Documents
- [Status](status.md)
- [Governance](../operations/governance.md)

## 10. Open Questions
- When is the first tagged release? Until then everything lives under `[Unreleased]`.
