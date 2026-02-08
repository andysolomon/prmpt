# Prompt Builder — Development Plan

## Vision
Build a personal-use Prompt Builder for software development that guides users through structured prompt components and generates consistently high-quality prompts for LLM coding assistants (Codex, ChatGPT, etc.). The app should support full-stack work and include presets for Salesforce and modern web stacks.

## Principles
- **Structured > free-text**: prompts are built from consistent components.
- **Model-first**: UI edits a typed `PromptSpec` object; formatters generate outputs.
- **Local-first MVP**: persist drafts and presets to `localStorage` (no backend required).
- **Quality rails**: prompt linting + warnings before export.
- **Composable**: new steps and new output formats should be easy to add.

---

## Architecture Overview

### Core Concepts
- **PromptSpec**: canonical, typed representation of a prompt.
- **Wizard Steps**: UI steps that edit parts of PromptSpec.
- **Formatters**: functions that convert PromptSpec to different export formats.
- **Linter**: analysis that produces structured issues + suggestions.
- **Presets**: named PromptSpecs (or partial specs) you can load instantly.

### Suggested Folder Structure
- `src/lib/prompt/`
  - `types.ts` (PromptSpec + supporting types)
  - `formatters/`
    - `chatText.ts`
    - `apiMessages.ts`
    - `json.ts`
  - `lint.ts`
  - `presets.ts`
  - `storage.ts`
- `src/components/prompt-builder/`
  - `PromptWizard.tsx`
  - `PreviewPanel.tsx`
  - `LintPanel.tsx`
  - `PresetPicker.tsx`
  - `steps/`
    - `GoalStep.tsx`
    - `ContextStep.tsx`
    - `InputsStep.tsx`
    - `TaskStep.tsx`
    - `OutputContractStep.tsx`
    - `ConstraintsStep.tsx`
    - `ReviewExportStep.tsx`
- `src/routes/` or `src/pages/` (depending on current router)
  - `PromptBuilderPage.tsx`

---

## MVP Scope (Phase 1)

### 1) PromptSpec Data Model
**Goal:** define stable, typed structure to power everything.

**Deliverables**
- `PromptSpec` TypeScript type:
  - `title`
  - `goal`
  - `persona` (optional)
  - `stackTags[]`
  - `contextNotes[]`
  - `inputs[]` (typed: code/logs/requirements/data)
  - `taskType` (enum)
  - `constraints[]`
  - `outputContract` (format + requirements)
  - `examples[]` (optional)
  - `assumptionsPolicy` (e.g., ask N questions or proceed)
  - `metadata` (timestamps, version)

**Acceptance Criteria**
- PromptSpec is serializable to JSON.
- PromptSpec supports all steps without needing UI-specific fields.

---

### 2) Formatters
**Goal:** generate consistent exports from PromptSpec.

**Deliverables**
- Chat-friendly single prompt text formatter.
- API messages formatter: `{ system, user }` (and optional `developer`).
- JSON export formatter.

**Acceptance Criteria**
- Same PromptSpec yields stable outputs.
- No UI logic inside formatters.

---

### 3) Prompt Linting
**Goal:** warn about missing pieces and common “bad prompt” patterns.

**Lint Rules**
- Missing/empty goal (error)
- Missing task type (error)
- Missing output contract (error)
- Vague language in goal/task (warning)
- Missing stack/context (warning)
- Huge inputs (warning + suggestion to summarize)
- Conflicting constraints (warning)

**Deliverables**
- `LintIssue` structure: `id`, `severity`, `message`, `fieldPath`, `suggestions[]`.
- Lint panel UI with grouped issues.

**Acceptance Criteria**
- Lint issues update live as PromptSpec changes.
- User can still export, but errors are clearly shown.

---

### 4) Wizard UI + Live Preview
**Goal:** guided creation with immediate feedback.

**UI Layout**
- Left: step navigation
- Center: current step editor
- Right: preview tabs (Chat Prompt / API Messages / JSON) + Lint panel

**Deliverables**
- Wizard step framework
- Each step edits PromptSpec
- Preview updates live

**Acceptance Criteria**
- Can complete a full prompt end-to-end
- Can copy prompt text
- Exports reflect current PromptSpec

---

### 5) Presets (Initial)
**Preset A: Salesforce Feature (Apex + LWC + Tests)**
- Encourages:
  - tests using `Assert` class
  - `SeeAllData=false`
  - file paths
  - governor-limit considerations
  - include acceptance criteria and edge cases

**Preset B: Next.js + shadcn UI Feature**
- Encourages:
  - accessible UI (keyboard/focus states)
  - file paths
  - tests (unit + component)
  - typescript strict usage

**Acceptance Criteria**
- One-click load preset into wizard
- Presets are editable and savable

---

### 6) Persistence (localStorage)
**Deliverables**
- Save/load current draft
- Save/load custom presets (add/edit/delete)

**Acceptance Criteria**
- Refresh keeps your current work
- Presets persist across sessions

---

## Phase 2 (After MVP)

### A) Prompt “Snippets” / Component Library
Reusable fragments:
- “Output Contract: Patch diff”
- “Testing requirements”
- “Error log triage format”

### B) Repo-aware features (optional)
- Paste repo tree and tag it as input
- “File-path aware” output mode

### C) Sharing
- Export prompt as link (encoded JSON in URL)
- Import PromptSpec JSON

### D) Backend (optional)
- Convex or similar for syncing presets across devices

---

## Implementation Order
1. `PromptSpec` types + defaults
2. Formatter functions
3. Linter engine
4. Wizard scaffold + Preview panel
5. Step components (Goal → Review)
6. Presets + preset picker UI
7. localStorage persistence
8. README updates + screenshots

---

## Definition of Done
- User can create a prompt via steps, see lint feedback, and export in 3 formats.
- Presets exist for Salesforce and Next.js/shadcn.
- Draft and presets persist locally.
- Codebase cleanly separates model/format/lint from UI.
