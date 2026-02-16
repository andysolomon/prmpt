# Sprint 7 — Track A Detailed Plan
## Organizer + Prompt Builder + Skill Builder (MVP)

**Track A goal for Sprint 7:** Ship the **library-first foundation** and a **Skill Builder MVP** that is truly usable: create → save → reopen → edit → export.

This track is the backbone of Sprint 7. If anything slips, it should be *non-essential polish* (animations, advanced filters, etc.), not core flows.

---

## 1) Outcomes (what users can do after Sprint 7)

### Library-first experience
- Land on a **Library Dashboard** that immediately helps users continue work:
  - Continue (last opened item)
  - Recents
  - Favorites
  - Quick create (Prompt / Skill)

### Skills are first-class citizens
- Create skills using a structured editor (not raw markdown)
- Manage skills in the Skills Library list
- View a skill detail page (overview + exports)
- Export a deterministic skill markdown format (v1)

---

## 2) UX Deliverables (screens & components)

### A1. Library Dashboard (new)
**Route:** `/library`

**Primary UI regions**
- Top bar:
  - App name / logo
  - Global search entry (can be a non-functional input that navigates to Skills/Prompts list with query param; full search is Sprint 9)
  - “New” button (dropdown: Prompt, Skill)
- Main panels:
  - **Continue** (single card)
    - Shows last opened prompt/skill with “Resume”
  - **Recents** (up to 10)
    - Cards show title, type badge, lastUsedAt, tags summary
  - **Favorites**
    - Cards show favorited items; quick open

**Interactions**
- Open item → navigates to item detail and calls `touchLastUsed(id)`
- Favorite toggle works from card

**Acceptance Criteria**
- Dashboard reflects real data changes after create/open/favorite without refresh.

---

### A2. Skills Library List (new)
**Route:** `/library/skills`

**List layout**
- Default: **table** (best for scanning) OR **compact cards** (ok)
- Columns (table suggestion):
  - Name
  - Status (Draft/Stable/Deprecated)
  - Targets (chips)
  - Tags (chips, max 3 + “+N”)
  - Updated
  - Actions (⋯)

**Controls**
- Search input (client-side filter on name/tags; real full-text later)
- Filter chips (optional v1): Favorites, Status
- “New Skill” CTA

**Row actions**
- Open
- Duplicate
- Favorite / Unfavorite
- Archive (optional v1)
- Delete (confirm)

**Acceptance Criteria**
- Create a new skill and see it appear instantly in list
- Duplicate creates a new item with “Copy” naming

---

### A3. Skill Detail View (new)
**Route:** `/library/skills/:id`

**Tabs**
1. **Overview**
   - Title, description
   - Metadata editor: status, tags, targets
   - Source/provenance placeholder (for future GitHub imports)
2. **Edit**
   - Skill Editor (see A4)
3. **Export**
   - Export panel (see A5)

**Header actions**
- Save
- Duplicate
- Favorite
- Export (opens Export tab)
- Back to list

**Acceptance Criteria**
- Saving persists changes and updates updatedAt
- Opening the page updates lastUsedAt

---

### A4. Skill Editor MVP (structured)
**Goal:** A practical structured editor that maps to `SkillSpec`.

**Recommended UI**
- Tabbed sections within Edit tab:
  - Overview
  - Inputs
  - Steps
  - Outputs
  - Verification

**Editor fields**
- Overview:
  - Name (required)
  - Description (required)
  - When to use (optional)
- Inputs:
  - List of inputs (name + description + required flag)
- Steps:
  - Ordered list of steps (each step is a markdown-ish textarea)
  - Add / delete / reorder (reorder can be simple “move up/down” v1)
- Outputs:
  - List of expected outputs (text + optional file path hint)
- Verification:
  - Checklist items (e.g., “Run tests”, “Verify lint passes”)

**Validation (basic)**
- Name required
- At least 1 step required
- Warn (non-blocking): missing outputs/verification

**Acceptance Criteria**
- User can build a coherent skill with 5–10 steps without friction.

---

### A5. Export Panel (Skill export v1)
**Goal:** Provide deterministic export that users can copy/paste into tools.

**Export formats for Sprint 7**
- **Claude-style SKILL.md** (primary)
  - Sections:
    - Title
    - Purpose / When to use
    - Inputs
    - Steps
    - Output expectations
    - Verification checklist
- Optional additional format if trivial:
  - “Plain text” export (same content, without markdown formatting)

**UX**
- Export tab shows:
  - Format dropdown (Claude SKILL.md, Plain)
  - Read-only preview textbox
  - Copy button
  - Download button (optional; copy is enough)

**Acceptance Criteria**
- Export output is stable (same spec → same text), and copy works reliably.

---

## 3) Data Model & Storage (local-first)

### A6. LibraryItem schema (v1)
```ts
type LibraryItemType = "prompt" | "skill";

type LibraryItemBase = {
  id: string;
  type: LibraryItemType;
  title: string;
  description?: string;
  tags: string[];
  targets: string[];      // ["claude", "cursor", "codex"]
  status: "draft" | "stable" | "deprecated";
  favorite: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
};
```

### A7. SkillSpec schema (v1)
```ts
type SkillInput = { name: string; description?: string; required?: boolean };

type SkillSpec = {
  name: string;
  description: string;
  whenToUse?: string;
  inputs: SkillInput[];
  steps: string[];               // ordered markdown-ish steps
  outputs: string[];             // expected outputs / artifacts
  verification: string[];        // checklist
  notes?: string;                // optional scratchpad
};
```

### A8. Storage API (required)
- `listItems({ type, includeArchived? })`
- `getItem(id)`
- `upsertItem(item)`
- `deleteItem(id)`
- `touchLastUsed(id)`
- `toggleFavorite(id)`

**Implementation suggestion**
- Use a single JSON blob key for library items + a small index:
  - `prmpt.libraryItems`
  - Keep migrations simple (version field).

---

## 4) Implementation Plan (tasks)

### A9. Routing & navigation
- Add new routes under a `LibraryLayout`:
  - `/library`
  - `/library/skills`
  - `/library/skills/:id`
- Add “Create Skill”:
  - Either `/create/skill` OR a modal that creates and navigates to `/library/skills/:id`

### A10. UI components (shadcn)
Recommended shadcn building blocks:
- `Card`, `Badge`, `Button`, `DropdownMenu`, `Dialog`
- `Tabs` for detail view
- `Input` for search, `Textarea` for step text
- `Command` for future command palette (stub ok)

### A11. Skill export formatter
- Create `renderSkillToClaudeMarkdown(skill: SkillSpec): string`
- Keep it deterministic:
  - stable ordering
  - consistent headings
  - no random whitespace

### A12. QA checklist for Track A
- Create skill → save → reload page → persists
- Duplicate skill → new id, title includes “Copy”
- Favorite skill → appears in dashboard favorites
- Export copies text correctly (no missing characters)
- lastUsedAt updates on open

---

## 5) Risks & scope guards
- **Risk:** Editor UX takes too long (reordering, complex nested steps)  
  **Guard:** Use simple steps list + move up/down in v1.

- **Risk:** Over-engineering prompts side in Sprint 7  
  **Guard:** Prompt library view can be minimal; skills must be complete.

- **Risk:** Storage migrations break existing data  
  **Guard:** Add a `schemaVersion` key; write a small migrate function.

---

## 6) Definition of Done (Track A)
Track A is done when:
- Library Dashboard exists and shows real Recents/Favorites,
- Skills Library list/detail/editor are end-to-end usable,
- Export v1 works (copyable Claude SKILL.md),
- Persistence is stable and ready for Convex later (clean storage API boundary).
