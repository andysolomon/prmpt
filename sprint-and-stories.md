# Prompt Builder App — Sprints & User Stories

## Assumptions
- Tech: React + TypeScript + shadcn/ui
- Local-first MVP (localStorage persistence)
- Core architecture: `PromptSpec` model + formatters + linter + wizard UI
- Presets: Salesforce + Next.js/shadcn
- Definition of Done for MVP: can build prompts end-to-end, see lint issues, export in multiple formats, and save drafts/presets locally

---

## Sprint 0 — Project Baseline & Setup (Foundation)
**Sprint Goal:** Establish a clean baseline, repo conventions, and development workflow.

### User Stories
**US-0.1: Project structure & conventions**
- As a developer, I want a consistent folder structure for prompt model/format/lint and UI components so the codebase stays maintainable.
- **Acceptance Criteria**
  - `src/lib/prompt/*` exists for types/formatters/lint/storage
  - `src/components/prompt-builder/*` exists for wizard/steps/panels
  - Basic barrel exports or clear import paths

**US-0.2: Dev scripts & formatting**
- As a developer, I want predictable scripts and lint/format rules so I can work fast without style churn.
- **Acceptance Criteria**
  - `npm run dev/build/lint` work (or equivalent)
  - Prettier/ESLint are configured (or existing config is validated)
  - README contains “How to run locally”

**US-0.3: Minimal routing entry point**
- As a user, I want a single “Prompt Builder” page so I can access the app’s core feature quickly.
- **Acceptance Criteria**
  - App has a clear entry route/page rendering the builder scaffold

---

## Sprint 1 — Core Model & Exports (PromptSpec + Formatters)
**Sprint Goal:** Make the app capable of representing a prompt as structured data and exporting it reliably.

### User Stories
**US-1.1: Create PromptSpec data model**
- As a user, I want prompts represented as structured components so prompts are consistent and reusable.
- **Acceptance Criteria**
  - `PromptSpec` type supports: title, goal, persona (optional), stack tags, context notes, inputs, task type, constraints, output contract, examples (optional), metadata
  - A `createDefaultPromptSpec()` function returns a valid spec

**US-1.2: Implement export formatter — Chat prompt**
- As a user, I want a clean single-text prompt I can paste into Codex/ChatGPT.
- **Acceptance Criteria**
  - Formatter produces a stable markdown/text output
  - Includes goal, context/stack, inputs, task type, constraints, output contract, examples when present

**US-1.3: Implement export formatter — API messages**
- As a user, I want system+user messages so I can use the prompt via API/agents.
- **Acceptance Criteria**
  - Formatter returns `{ system: string, user: string }` (optionally developer)
  - System includes role/persona & quality bar; user includes task + inputs + output contract

**US-1.4: Implement export formatter — JSON**
- As a user, I want to export/import PromptSpec JSON for reuse and sharing.
- **Acceptance Criteria**
  - JSON export is valid, includes version metadata
  - Import validates shape (basic runtime checks) and falls back safely

---

## Sprint 2 — Linting & Prompt Quality Rails
**Sprint Goal:** Provide immediate feedback that improves prompt quality before exporting.

### User Stories
**US-2.1: Lint engine (structured issues)**
- As a user, I want warnings/errors so I know what’s missing or unclear before I export a prompt.
- **Acceptance Criteria**
  - Linter returns issues: `{ id, severity, message, fieldPath?, suggestions[]? }`
  - Severities: `error | warning | info`
  - Rules include:
    - Missing goal (error)
    - Missing task type (error)
    - Missing output contract (error)
    - Vague goal/task (warning)
    - Missing stack/context (warning)
    - Overlarge inputs (warning + suggestion)

**US-2.2: Lint panel UI**
- As a user, I want to see lint issues in a clear panel so I can fix them quickly.
- **Acceptance Criteria**
  - Issues grouped by severity
  - Clicking an issue navigates/focuses the relevant step/field (best-effort)
  - Errors visually distinct from warnings (badges/alerts)

**US-2.3: Prompt “lint score” summary (optional)**
- As a user, I want a quick summary of quality so I can tell if the prompt is “ready”.
- **Acceptance Criteria**
  - Simple summary: `Ready / Needs work` + counts by severity

---

## Sprint 3 — Wizard UI (Step-Based Builder + Live Preview)
**Sprint Goal:** Build the guided experience that edits PromptSpec and shows output live.

### User Stories
**US-3.1: Wizard shell + step navigation**
- As a user, I want a step-by-step flow so I don’t forget key prompt components.
- **Acceptance Criteria**
  - Steps display in a left nav with current step highlighted
  - Next/Back controls
  - Step completion indicators (e.g., checkmark when key fields satisfied)

**US-3.2: Step — Goal**
- As a user, I want to define a clear goal so the AI produces correct output.
- **Acceptance Criteria**
  - Goal field required
  - Optional title field
  - Helper text/examples

**US-3.3: Step — Context/Stack**
- As a user, I want to specify stack and constraints so the AI matches my environment.
- **Acceptance Criteria**
  - Tag-based stack selector (React, shadcn, Next.js, Prisma, Postgres, Salesforce, Apex, LWC, GitHub Actions, etc.)
  - Context notes list (add/remove)

**US-3.4: Step — Inputs**
- As a user, I want to attach code/logs/requirements so the AI has the necessary details.
- **Acceptance Criteria**
  - Add input items with type (code/logs/requirements/data) and content
  - Each input can have optional label and language
  - Basic character count shown

**US-3.5: Step — Task Type**
- As a user, I want to choose the kind of help I need so the AI responds appropriately.
- **Acceptance Criteria**
  - Select from enums: implement, debug, refactor, tests, architecture, docs, etc.

**US-3.6: Step — Output Contract**
- As a user, I want to specify exactly what format I want back so I get usable results.
- **Acceptance Criteria**
  - Choose output mode: full files, patch diff, plan, code + explanation
  - Requirements checklist: file paths, commands, tests, edge cases

**US-3.7: Step — Constraints**
- As a user, I want to add rules (don’t add deps, keep API stable) so changes don’t break my project.
- **Acceptance Criteria**
  - Add/remove constraints list
  - Common constraint chips (no new deps, keep types strict, etc.)

**US-3.8: Step — Review/Export**
- As a user, I want to review the final prompt and export it in multiple formats.
- **Acceptance Criteria**
  - Tabs: Chat Prompt / API Messages / JSON
  - Copy-to-clipboard for each
  - Lint panel visible alongside exports

**US-3.9: Live Preview panel**
- As a user, I want to see the prompt update live so I can iterate quickly.
- **Acceptance Criteria**
  - Preview updates as PromptSpec changes
  - Monospace formatting for exports

---

## Sprint 4 — Presets & Local Persistence
**Sprint Goal:** Make the tool fast for repeat use with presets and saved drafts.

### User Stories
**US-4.1: Built-in presets**
- As a user, I want one-click presets so I can start from high-quality templates.
- **Acceptance Criteria**
  - Preset: “Salesforce Feature (Apex + LWC + Tests)”
    - Includes: Assert usage, SeeAllData=false, governor limits note, file paths, test requirements
  - Preset: “Next.js + shadcn Feature”
    - Includes: accessibility requirements, file paths, tests, TS strict

**US-4.2: Preset picker UI**
- As a user, I want to select a preset and immediately see the wizard populated.
- **Acceptance Criteria**
  - Preset dropdown/list
  - Applying a preset replaces current spec (with warning/undo best-effort)

**US-4.3: Save/load draft**
- As a user, I want my in-progress prompt saved automatically so I don’t lose work.
- **Acceptance Criteria**
  - Auto-save to localStorage
  - Manual “Save draft” and “Reset” options

**US-4.4: Create custom presets**
- As a user, I want to save a PromptSpec as a reusable preset.
- **Acceptance Criteria**
  - “Save as preset” action
  - Presets list shows custom presets
  - Ability to delete custom preset

---

## Sprint 5 — Polish, Docs, and “Day-2” Usability
**Sprint Goal:** Make it pleasant and durable for daily use.

### User Stories
**US-5.1: README + quickstart + architecture**
- As a developer, I want documentation so future changes are easy.
- **Acceptance Criteria**
  - README includes: run instructions, architecture overview, how to add a preset, where to edit formatters/lint rules

**US-5.2: Example gallery**
- As a user, I want example prompts so I can learn how to use the tool effectively.
- **Acceptance Criteria**
  - Small gallery of example PromptSpecs (non-editable or loadable)

**US-5.3: UX enhancements**
- As a user, I want small UX improvements so building prompts is faster.
- **Acceptance Criteria**
  - Keyboard shortcuts: copy active export, next/prev step (optional)
  - Better empty states + helper text
  - Confirmation on destructive actions (reset/delete preset)

**US-5.4: Basic telemetry-free error handling**
- As a user, I want clear errors if something breaks, without external tracking.
- **Acceptance Criteria**
  - User-facing error boundary/message for export or parse failures
  - Safe fallback to default PromptSpec if storage is corrupted

---

## Sprint 6 — Optional Enhancements (Backlog)
**Sprint Goal:** Add power features once MVP is stable.

### User Stories
**US-6.1: Import/export as file**
- As a user, I want to download/upload PromptSpec JSON files for portability.
- **US-6.2: “Prompt snippets” library**
- As a user, I want reusable blocks (e.g., “Output as patch diff”) I can insert into any prompt.
- **US-6.3: Input summarizer helper**
- As a user, I want help trimming large logs/code into a summarized input block (manual or assisted).
- **US-6.4: URL share**
- As a user, I want to share a prompt spec via URL encoding for quick collaboration.

---

## Milestones
- **M1 (end Sprint 1):** PromptSpec + exports working in isolation
- **M2 (end Sprint 2):** Lint rules implemented + visible results
- **M3 (end Sprint 3):** Wizard UI end-to-end + live preview + exports
- **M4 (end Sprint 4):** Presets + local persistence (daily-driver ready)
- **M5 (end Sprint 5):** Polished UX + docs

---

## Definition of Done (MVP)
- User can complete wizard steps and generate exports (Chat / API / JSON)
- Lint catches missing/vague prompt pieces with clear guidance
- Presets exist for Salesforce and Next.js/shadcn
- Draft and presets persist locally
- Clean separation of model/formatter/lint from UI
