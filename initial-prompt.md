You are a senior full-stack engineer. Help me improve my prompt builder app repo and implement a real “wizard + prompt spec + formatter + lint” architecture.

Repo: https://github.com/andysolomon/prompt-builder

High-level goal:
Build a personal-use Prompt Builder for software development (React/shadcn). It should guide the user through structured prompt components and generate a high-quality final prompt (and other export formats). It should be designed for full-stack work, with templates/presets I’ll reuse (Salesforce + general full-stack).

Tech constraints:
- React + TypeScript
- shadcn/ui components
- Keep it simple and local-first initially (localStorage is fine). Avoid adding heavy new dependencies.
- Prioritize clean architecture: “data model (PromptSpec)” separate from UI.
- Must include a live preview panel.
- Must include a “prompt lint” review panel with warnings/errors and suggested fixes.

Deliverables:
1) Create a canonical PromptSpec data model in TypeScript, plus supporting types (inputs, constraints, examples, output contract).
2) Implement a step-based Wizard UI that edits the PromptSpec. Suggested steps:
   - Goal
   - Context/Stack (tag-based)
   - Inputs (code/logs/requirements)
   - Task Type
   - Output Contract
   - Constraints
   - Review/Export
3) Implement formatters that convert PromptSpec into:
   - Chat-friendly prompt (single text prompt)
   - API messages format (system + user)
   - JSON export (PromptSpec)
4) Implement prompt linting:
   - Missing goal
   - Missing task type
   - No output contract
   - Vague goal/task (“make it better”, “fix it” without context)
   - No stack/context (optional warning)
   - Inputs too large (warn and suggest summarizing)
   Linter should output structured issues with severity, message, and optional “quick fix” suggestions.
5) Add preset templates:
   - “Salesforce Feature (Apex + LWC + Tests)” preset:
     - include guidance: use Assert class in tests, avoid SeeAllData, mention governor limits, include file paths.
   - “Next.js + shadcn UI Feature” preset:
     - include accessibility requirements, file paths, and tests.
6) Persist/load PromptSpec drafts and presets to localStorage.
7) Provide a minimal README update describing architecture, how to run, and how to add presets.

Work style:
- First: read the repo structure and explain what you’re changing.
- Then: implement incrementally with small, reviewable commits (describe changes per commit).
- Output actual code changes with file paths and contents.
- Prefer creating new files rather than rewriting everything at once.
- Keep components cohesive: /lib for PromptSpec + formatters + linter; /components for UI; /pages or /routes depending on current setup.

When you need to make assumptions:
- Make reasonable defaults and proceed.
- Document assumptions in code comments and the development plan.

Start by:
- Inspecting the existing repo and identifying the current entry points and component structure.
- Proposing a folder structure and implementing PromptSpec + formatter + linter first, then UI steps.
