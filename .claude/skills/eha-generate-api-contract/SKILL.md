---
description: "EHA skill — generate-api-contract"
---

## EHA Project Doc Rules

**4-Layer Taxonomy.** All project docs live under `docs/project-docs/`:
- `foundation/` — prd, architecture, workflow, status, phases, changelog, feature-inventory
- `operations/` — ci-cd, production-runbook, governance, compliance, observability, security
- `development/` — testing, api-contract, database, ui-ux, error-handling, internationalization
- `technical-guidelines/` — domain-specific cross-cutting rules (API, database, logging, etc.)

**Legacy/Reference Docs:** Treat folders named `archive/`, `docs-legacy/`, or `reference/` as secondary migration input only, never as authoritative active truth.

**Mandatory core docs:** `index.md`, `getting-started.md`, `foundation/prd.md`, `foundation/architecture.md`, `foundation/workflow.md`, `foundation/status.md`, `operations/ci-cd.md`, `operations/production-runbook.md`, `development/testing.md`, `development/api-contract.md`, `development/database.md`, `development/ui-ux.md`.

**Authority order:** project docs → codebase → agent judgment. When docs conflict, the owning doc wins. When code and docs conflict and authority is unclear, surface the conflict and ask the user — do not guess.

**Universal stable headings (every file):** Description, Important, Table of Contents, Scope, Goals, Non Goals.

**Key ownership rules:**
- Vision, personas, requirements → `foundation/prd.md`
- Stack and architecture → `foundation/architecture.md`
- Dev loop and PR process → `foundation/workflow.md`
- Verification commands and quality gates → `development/testing.md`
- Execution plan and progress → `foundation/status.md`
- Sprint tracking and backlogs → `foundation/phases/`
- Optional doc inventory → `index.md`
- Domain-specific technical rules → `technical-guidelines/` (Create these only for durable cross-cutting rules; avoid placeholders).

**SDD rule:** Specifications dictate implementation. Follow a strict 4-step workflow: 1. Update project docs first, 2. Generate tests based on the specs, 3. Generate code to pass the tests, 4. Logically map every code change back to a spec requirement. Refuse to write code for features not in the spec.

**Flexible Baselines Principle:** Omit docs the repo doesn't need. Mark unknowns as `TBD` or `Assumption`. Mark inferred facts as `Inferred from codebase` until the user confirms them.

---

# Generate API Contract

Produces structured documentation for existing API endpoints by reading the repository's routing and implementation files. This skill is language-agnostic and relies on the project's own routing and handler patterns.

## Required Project Inputs

Read the following project documents before starting to understand the repository's architecture and expected output format:
- \`docs/project-docs/foundation/architecture.md\` (to understand the application's layers, routing strategy, and handler patterns)
- \`docs/project-docs/development/api-contract.md\` (to see if an existing API documentation format or schema is already defined)

## Procedure

### Step 1 — Intake & Scope Definition
Ask the user briefly for the following if not provided:
- Primary domain or module to document
- Domains or modules to **exclude** (e.g., boilerplate, master data, shared utilities) so the scan stays focused
- First feature to document (as a starting point)
- Desired output path
- Language for endpoint descriptions (e.g., English, Indonesian)

### Step 2 — Understand the Codebase Pattern
Use the architecture documentation to identify how HTTP requests flow through the application. Determine:
- Where are routes defined?
- Where are request handlers located?
- Where are request payloads (DTOs/structs/classes) defined and validated?
- Where are response envelopes and shapes defined?

### Step 3 — Enumerate All Routes in Scope
- Open the relevant routing file(s) for the requested domain/module.
- Count every non-commented route line individually (GET, POST, PUT, DELETE, etc.).
- Record the HTTP method, path, and handler function name for each route.
- This count is your target: every single route found here must appear in the final documentation. Keep this route ledger — Step 6 reconciles it against what you actually wrote.

### Step 4 — Analyze Each Endpoint
For each route identified, trace through its handler and full business-logic chain (handler → service/use-case → data/persistence layer) to determine:
- **Headers:** Any required or optional HTTP headers.
- **Input kind:** Trace the code to decide whether the endpoint reads query params, a request body, or both — do not assume from the HTTP method.
- **Payload/Response Structure:** Trace through return values to reconstruct the exact shape (object vs array, and every nested level). Account for any shared response envelope/wrapper the framework applies around handler output.
- **Types:** Use proper type names (`string`, `integer`, `float`, `boolean`, `array`, `file`) — never example values. Then sharpen them:
  - Date/time fields → note the format (e.g., RFC 3339).
  - Float fields → note expected decimal precision, especially for monetary values.
  - Enum-typed fields → list every possible value.
  - Nullable or optional markers in the project's type system (optional/pointer types, nullable annotations) → mark the field Optional or nullable.
  - Serialization tags or mappers defined inline on the handler/use-case take precedence over the base model definition — trace and document the effective serialized shape.
- **Status:** Classify each field and justify it from the code:
  - **Required** — enforced as required by validation or always present in the output.
  - **Optional** — may be absent (nullable type or conditionally populated without a fixed rule).
  - **Conditional** — present only when a specific condition is met; state that condition explicitly beneath the table.

### Step 5 — Output Generation
Follow the project's existing API contract format if defined in \`development/api-contract.md\`. If no rigid format exists, use this sensible default structure per endpoint:

#### Default Endpoint Format
**[number]. [METHOD] - [Endpoint name]**

| Version | Description | Status |
|---------|-------------|--------|
| v1 | [Short description in chosen language] | Live |

| Endpoint | Type | Scope |
|----------|------|-------|
| \`[path]\` | [METHOD] | Public / Private / Public & Private |

**Headers**
| Name | Type | Status |
|------|------|--------|
| [Name] | [Type] | [Status] |

**Query Params** (omit if none)
| Field | Type | Status |
|-------|------|--------|
| [Field] | [Type] | [Status] |

**Payload / Response**
Provide a structured JSON example with inline type annotations, or a table for form-data.

### Step 6 — Verify Coverage
Before finishing, reconcile what you wrote against the Step 3 route ledger:
- The count of documented endpoints must equal the count of routes found. Any difference is a gap to close.
- Confirm every HTTP method + path from the routing file is represented, including private/internal routes.
- Re-trace any endpoint whose payload/response shape was inferred rather than read from code, and verify it against the handler.
- If a route cannot be documented (e.g., deprecated, unimplemented), list it explicitly under a "Not Documented" note with the reason rather than silently dropping it.

## Quality Check
- Do not guess shapes; trace the actual handler and payload models.
- Headers and Query/Payload tables must always be separate — never combine them.
- Do not flatten nested JSON structures into single-level tables; show the full nested shape.
- Use proper type names, not example values. No `Last Updated` field; no free-text `Description` column inside Headers / Query Params / Payload tables.
- When an endpoint is reachable on more than one scope, record it once with a combined Scope (e.g., `Public & Private`).
- Add a Table of Contents at the top of each generated file listing every endpoint title.
- Document 100% of the routes found in Step 3 — verified by the Step 6 reconciliation.

## Output Contract
Write the generated documentation directly to the requested output path. Begin with the starting feature requested in Step 1, then continue through the remaining features in scope. If the output is large, split it logically by feature into separate files and add an `index`/`README` file linking them.
