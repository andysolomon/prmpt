# Prompt Builder

A local-first React + TypeScript app for building high-quality engineering prompts with a structured wizard, live exports, and prompt linting.

## Features

- Zod-backed `PromptSpec` schema and runtime validation
- Step-based wizard (Goal, Context, Inputs, Task Type, Output Contract, Constraints, Review)
- Live preview tabs for:
  - Chat prompt
  - API messages (`system` + `user`)
  - JSON
- Prompt lint panel with structured issues (`error`, `warning`, `info`)
- Built-in presets:
  - Salesforce Feature (Apex + LWC + Tests)
  - Next.js + shadcn UI Feature
- Local persistence for drafts and custom presets via `localStorage`

## Tech Stack

- React 18
- TypeScript (strict)
- Vite
- Tailwind + shadcn-style components
- Zod
- Jest + ts-jest

## Run Locally

1. Install dependencies

```bash
bun install
```

2. Start dev server

```bash
bun run dev
```

3. Open `http://localhost:5173`

## Quality Checks

Type check:

```bash
npm run type-check
```

Lint:

```bash
npm run lint
```

Tests (watchman disabled in restricted environments):

```bash
npm test -- --runInBand --watchman=false
```

## Architecture

### Prompt domain (model-first)

- `src/lib/prompt/schema.ts`
  - Zod schemas and inferred TS types (`PromptSpec`, input/output/task enums)
- `src/lib/prompt/defaults.ts`
  - default model factory and metadata updates
- `src/lib/prompt/formatters/`
  - `chatText.ts`, `apiMessages.ts`, `json.ts`
- `src/lib/prompt/lint.ts`
  - lint rules and structured `LintIssue[]`
- `src/lib/prompt/presets.ts`
  - built-in preset catalog
- `src/lib/prompt/storage.ts`
  - validated load/save for draft + custom presets

### UI

- `src/components/prompt-builder/PromptBuilderPage.tsx`
  - top-level orchestration (state, autosave, lint, presets)
- `src/components/prompt-builder/PromptWizard.tsx`
  - step navigation and editor shell
- `src/components/prompt-builder/steps/*`
  - individual wizard steps
- `src/components/prompt-builder/PreviewPanel.tsx`
  - export previews + copy actions
- `src/components/prompt-builder/LintPanel.tsx`
  - grouped lint feedback

## Extending the app

### Add a built-in preset

Edit `src/lib/prompt/presets.ts` and append a new `PromptPreset` entry to `BUILT_IN_PRESETS`.

### Add/adjust lint rules

Edit `src/lib/prompt/lint.ts` in `lintPromptSpec()` and add a new `LintIssue` condition.

### Add output format logic

Add a formatter in `src/lib/prompt/formatters/` and wire it into `PreviewPanel.tsx`.
