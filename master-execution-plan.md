<LeftMouse># Master Execution Plan: Sprints 7–12 (Tracks A + B + E + F)

## Tracks included
- **A:** Organizer + Prompt Builder + Skill Builder + (optional) MCP Tools
- **B:** UI Prompt Builder (Aura-like) — Layout/Styling/Components/Page
- **E:** Organizer 2.0 + Convex adoption (phased, optional sync first)
- **F:** Import Skills from GitHub URL (public first, Convex-backed later)

## Why this combo works
- **A+B** deliver the core product experience (build + preview + export)
- **E** makes the organizer durable (sync + better search)
- **F** makes the library instantly useful (bootstrap skills with a URL)

---

## Sprint 7 — Library Foundation + Skill Builder MVP + UI Builder Scaffolding
**Sprint Goal:** Make PRMPT feel like a library-first app; ship Skills end-to-end; start UI Builder architecture.

### Track A (Organizer + Skills)
- Library Dashboard: Search entry + Recents + Favorites + Continue
- Skills Library list view + Skill detail view
- Skill Builder MVP: create/edit/save SkillSpec as library items
- Metadata v1: tags, targets, status (draft/stable/deprecated), lastUsedAt
- Export v1 for Skills (Claude format minimum)

### Track B (UI Builder)
- Create → UI Prompt Builder landing page (cards for Layout/Styling/Components/Page)
- `UiPromptSpec` model + defaults
- `UiPromptSpec -> PromptSpec` bridge formatter
- Prompt preview panel (basic) powered by bridge

### Track E (Organizer groundwork)
- Decide/lock organizer data model (LibraryItem + Collection + Version stubs)
- Local-first persistence abstraction (so Convex can swap in later)

### Track F (prep only)
- Add “Import” entry point stub in Skills Library (button + disabled modal placeholder)
  - (No fetching yet; just reserving the UX slot)

**Definition of Done**
- User can create a skill and manage it from the library
- UI Builder exists as a module and can generate a prompt via bridge

---

## Sprint 8 — Prompt Library + Multi-Target Exports + UI Layout Builder MVP
**Sprint Goal:** Prompts become first-class library items; exports feel polished; ship Layout Builder.

### Track A (Organizer + Prompts)
- Prompts Library list + Prompt detail view
- Unified Export panel for prompts:
  - Chat prompt / API system+user / JSON
- Multi-target export UX (Codex/Claude/Cursor bundles where applicable)
- “Save to Library” from Prompt Builder and UI builder

### Track B (UI Builder: Layout MVP)
- Layout Builder knobs:
  - page pattern, navigation pattern, density, responsiveness, content model, states
- Structural preview (wireframe) in center panel
- Right panel: prompt preview + copy buttons
- Save UI prompts into library with tags: `ui`, `layout`, stack tags

### Track E (Organizer UX polish)
- Consistent list/grid components across Prompts/Skills
- Bulk actions v1: favorite, archive, tag

**Definition of Done**
- Prompts and Skills are both library-managed
- UI Layout Builder is usable end-to-end (knobs → preview → prompt → save)

---

## Sprint 9 — Global Search/Filters + Skill Simulation + UI Styling + GitHub Import MVP (GH-1)
**Sprint Goal:** Make the library fast to navigate; validate skills; add styling builder; ship GitHub import MVP.

### Track A (Quality + Skills)
- Skill simulator (dry run) + lint v2 + “apply fix” actions
- Shared “Issues” panel component (Prompt + Skill editors)

### Track B (UI Builder: Styling)
- Styling knobs: theme, vibe, radius, shadow, spacing, typography
- Component style preview (card/button/input/table skeleton)
- Improved prompt generation from styling knobs
- Save styling prompts to library

### Track E (Organizer 2.0 UX)
- **Global search** (title/description/tags; optionally content preview)
- Filters: type, targets, tags, favorites, archived, status
- Cmd+K command palette (open/create/export/import)

### Track F (GitHub Import GH-1)
- Import modal accepts GitHub URL
- Support importing:
  - a single `SKILL.md` file URL
  - a folder containing `SKILL.md`
- Post-import summary (imported/skipped/warnings)
- Tag imported skills: `imported`, `github:<owner>/<repo>`
- Store provenance: source url + ref + path + importedAt

**Definition of Done**
- Search makes retrieval quick
- Skill import works for public URLs (file/folder) and creates library skills

---

## Sprint 10 — Templates Gallery + UI Components Builder + GitHub Import Repo Scan (GH-2)
**Sprint Goal:** Accelerate creation with templates; add components builder; upgrade GitHub import to multi-skill repo scan.

### Track A (Templates + Starters)
- Templates Gallery for Prompts + Skills
- Create-from-template creates library items immediately
- Starter packs for common dev work (bugfix, feature, tests, refactor)

### Track B (UI Builder: Components)
- shadcn component picker (datatable/dialog/drawer/command/tabs/form/toast)
- Behavior toggles (sort/filter/pagination, keyboard nav, validation)
- Component sandbox preview (dummy content + state toggles)
- Export includes “implementation checklist”

### Track E (Organizer enhancements)
- Smart Collections (saved searches) v1
- Bulk actions v2: add to collection, export selection

### Track F (GitHub Import GH-2)
- Repo scan support:
  - repo root or subtree URL
  - scan for `**/SKILL.md`
- Batch import with selection UI
- Dedupe by `contentHash` with “skip/update” option

**Definition of Done**
- Templates reduce time-to-create dramatically
- Users can import multiple skills from a repo in one flow

---

## Sprint 11 — Collections (Packs) + UI Page Builder MVP + Convex Phase 1 (Optional Sync)
**Sprint Goal:** Turn the organizer into a workspace with packs; ship end-to-end UI Page builder; add optional cloud sync with Convex.

### Track A (Collections + Export)
- Collections (packs): create, edit, add/remove, reorder
- Export pack as zip/bundle

### Track B (UI Builder: Page/Screen)
- Page builder inputs: screen name, route, entities, interactions
- Output contract presets: full files vs patch diff
- File tree preview (suggested output structure)
- Save as UI template

### Track E (Convex C-1: Optional Sync)
- Convex backend scaffold:
  - libraryItems, collections, versions (stub), savedSearches
- Settings: “Enable Cloud Sync”
- Migration: local → convex on enable
- Auth integration (provider TBD) and per-user data isolation

### Track F (Import: reliability improvements)
- If Convex is present, route GitHub import through Convex action (optional step)
  - improves rate-limit handling + scanning reliability

**Definition of Done**
- Users can create packs and export them
- Page builder produces implementation-ready UI prompts
- Optional: signed-in users can sync library across devices

---

## Sprint 12 — Convex Full-Text Search + GitHub Import → SkillSpec Normalize (GH-3) + Optional Smart UX
**Sprint Goal:** Make search “instant” and consistent; make imported skills editable as SkillSpec; optionally add smart recommendations.

### Track A (Optional tools / smart layer)
- Tools (MCP) registry (optional) OR defer to later
- Quality rails polish

### Track B (Optional UI recommendations)
- UI lint rules + recommended additions (command palette, empty states, etc.)
- One-click apply recommendations

### Track E (Convex C-2: Full-text Search)
- Convex full-text search index for library items
- Global search powered by Convex when sync enabled
- Saved searches sync across devices

### Track F (GitHub Import GH-3)
- Parse imported `SKILL.md` into structured `SkillSpec` (best-effort)
- Preserve raw markdown when parsing incomplete
- Run skill lint post-import and route user to “Fix imported skill” flow

**Definition of Done**
- Search is fast and high quality (especially with sync enabled)
- Imported skills become first-class editable SkillSpec items

---

## Notes on Scope Control
- **Convex is optional until Sprint 11**: keep local-first as default, then add “Sync mode.”
- **GitHub Import ships in Sprint 9** (MVP) and gets stronger in Sprint 10 and 12.
- **MCP tools registry** stays optional—only include if it won’t disrupt search/sync/import.

---

## Final Milestones
- **End Sprint 8:** Library-first app + UI Layout Builder shipped
- **End Sprint 9:** Search/filters + Skill simulation + GitHub import MVP shipped
- **End Sprint 10:** Templates + UI Components Builder + repo scan import shipped
- **End Sprint 11:** Packs + UI Page Builder + optional Convex sync shipped
- **End Sprint 12:** Convex full-text search + imported skills editable shipped
# Master Execution Plan: Sprints 7–12 (Tracks A + B + E + F)

## Tracks included
- **A:** Organizer + Prompt Builder + Skill Builder + (optional) MCP Tools
- **B:** UI Prompt Builder (Aura-like) — Layout/Styling/Components/Page
- **E:** Organizer 2.0 + Convex adoption (phased, optional sync first)
- **F:** Import Skills from GitHub URL (public first, Convex-backed later)

## Why this combo works
- **A+B** deliver the core product experience (build + preview + export)
- **E** makes the organizer durable (sync + better search)
- **F** makes the library instantly useful (bootstrap skills with a URL)

---

## Sprint 7 — Library Foundation + Skill Builder MVP + UI Builder Scaffolding
**Sprint Goal:** Make PRMPT feel like a library-first app; ship Skills end-to-end; start UI Builder architecture.

### Track A (Organizer + Skills)
- Library Dashboard: Search entry + Recents + Favorites + Continue
- Skills Library list view + Skill detail view
- Skill Builder MVP: create/edit/save SkillSpec as library items
- Metadata v1: tags, targets, status (draft/stable/deprecated), lastUsedAt
- Export v1 for Skills (Claude format minimum)

### Track B (UI Builder)
- Create → UI Prompt Builder landing page (cards for Layout/Styling/Components/Page)
- `UiPromptSpec` model + defaults
- `UiPromptSpec -> PromptSpec` bridge formatter
- Prompt preview panel (basic) powered by bridge

### Track E (Organizer groundwork)
- Decide/lock organizer data model (LibraryItem + Collection + Version stubs)
- Local-first persistence abstraction (so Convex can swap in later)

### Track F (prep only)
- Add “Import” entry point stub in Skills Library (button + disabled modal placeholder)
  - (No fetching yet; just reserving the UX slot)

**Definition of Done**
- User can create a skill and manage it from the library
- UI Builder exists as a module and can generate a prompt via bridge

---

## Sprint 8 — Prompt Library + Multi-Target Exports + UI Layout Builder MVP
**Sprint Goal:** Prompts become first-class library items; exports feel polished; ship Layout Builder.

### Track A (Organizer + Prompts)
- Prompts Library list + Prompt detail view
- Unified Export panel for prompts:
  - Chat prompt / API system+user / JSON
- Multi-target export UX (Codex/Claude/Cursor bundles where applicable)
- “Save to Library” from Prompt Builder and UI builder

### Track B (UI Builder: Layout MVP)
- Layout Builder knobs:
  - page pattern, navigation pattern, density, responsiveness, content model, states
- Structural preview (wireframe) in center panel
- Right panel: prompt preview + copy buttons
- Save UI prompts into library with tags: `ui`, `layout`, stack tags

### Track E (Organizer UX polish)
- Consistent list/grid components across Prompts/Skills
- Bulk actions v1: favorite, archive, tag

**Definition of Done**
- Prompts and Skills are both library-managed
- UI Layout Builder is usable end-to-end (knobs → preview → prompt → save)

---

## Sprint 9 — Global Search/Filters + Skill Simulation + UI Styling + GitHub Import MVP (GH-1)
**Sprint Goal:** Make the library fast to navigate; validate skills; add styling builder; ship GitHub import MVP.

### Track A (Quality + Skills)
- Skill simulator (dry run) + lint v2 + “apply fix” actions
- Shared “Issues” panel component (Prompt + Skill editors)

### Track B (UI Builder: Styling)
- Styling knobs: theme, vibe, radius, shadow, spacing, typography
- Component style preview (card/button/input/table skeleton)
- Improved prompt generation from styling knobs
- Save styling prompts to library

### Track E (Organizer 2.0 UX)
- **Global search** (title/description/tags; optionally content preview)
- Filters: type, targets, tags, favorites, archived, status
- Cmd+K command palette (open/create/export/import)

### Track F (GitHub Import GH-1)
- Import modal accepts GitHub URL
- Support importing:
  - a single `SKILL.md` file URL
  - a folder containing `SKILL.md`
- Post-import summary (imported/skipped/warnings)
- Tag imported skills: `imported`, `github:<owner>/<repo>`
- Store provenance: source url + ref + path + importedAt

**Definition of Done**
- Search makes retrieval quick
- Skill import works for public URLs (file/folder) and creates library skills

---

## Sprint 10 — Templates Gallery + UI Components Builder + GitHub Import Repo Scan (GH-2)
**Sprint Goal:** Accelerate creation with templates; add components builder; upgrade GitHub import to multi-skill repo scan.

### Track A (Templates + Starters)
- Templates Gallery for Prompts + Skills
- Create-from-template creates library items immediately
- Starter packs for common dev work (bugfix, feature, tests, refactor)

### Track B (UI Builder: Components)
- shadcn component picker (datatable/dialog/drawer/command/tabs/form/toast)
- Behavior toggles (sort/filter/pagination, keyboard nav, validation)
- Component sandbox preview (dummy content + state toggles)
- Export includes “implementation checklist”

### Track E (Organizer enhancements)
- Smart Collections (saved searches) v1
- Bulk actions v2: add to collection, export selection

### Track F (GitHub Import GH-2)
- Repo scan support:
  - repo root or subtree URL
  - scan for `**/SKILL.md`
- Batch import with selection UI
- Dedupe by `contentHash` with “skip/update” option

**Definition of Done**
- Templates reduce time-to-create dramatically
- Users can import multiple skills from a repo in one flow

---

## Sprint 11 — Collections (Packs) + UI Page Builder MVP + Convex Phase 1 (Optional Sync)
**Sprint Goal:** Turn the organizer into a workspace with packs; ship end-to-end UI Page builder; add optional cloud sync with Convex.

### Track A (Collections + Export)
- Collections (packs): create, edit, add/remove, reorder
- Export pack as zip/bundle

### Track B (UI Builder: Page/Screen)
- Page builder inputs: screen name, route, entities, interactions
- Output contract presets: full files vs patch diff
- File tree preview (suggested output structure)
- Save as UI template

### Track E (Convex C-1: Optional Sync)
- Convex backend scaffold:
  - libraryItems, collections, versions (stub), savedSearches
- Settings: “Enable Cloud Sync”
- Migration: local → convex on enable
- Auth integration (provider TBD) and per-user data isolation

### Track F (Import: reliability improvements)
- If Convex is present, route GitHub import through Convex action (optional step)
  - improves rate-limit handling + scanning reliability

**Definition of Done**
- Users can create packs and export them
- Page builder produces implementation-ready UI prompts
- Optional: signed-in users can sync library across devices

---

## Sprint 12 — Convex Full-Text Search + GitHub Import → SkillSpec Normalize (GH-3) + Optional Smart UX
**Sprint Goal:** Make search “instant” and consistent; make imported skills editable as SkillSpec; optionally add smart recommendations.

### Track A (Optional tools / smart layer)
- Tools (MCP) registry (optional) OR defer to later
- Quality rails polish

### Track B (Optional UI recommendations)
- UI lint rules + recommended additions (command palette, empty states, etc.)
- One-click apply recommendations

### Track E (Convex C-2: Full-text Search)
- Convex full-text search index for library items
- Global search powered by Convex when sync enabled
- Saved searches sync across devices

### Track F (GitHub Import GH-3)
- Parse imported `SKILL.md` into structured `SkillSpec` (best-effort)
- Preserve raw markdown when parsing incomplete
- Run skill lint post-import and route user to “Fix imported skill” flow

**Definition of Done**
- Search is fast and high quality (especially with sync enabled)
- Imported skills become first-class editable SkillSpec items

---

## Notes on Scope Control
- **Convex is optional until Sprint 11**: keep local-first as default, then add “Sync mode.”
- **GitHub Import ships in Sprint 9** (MVP) and gets stronger in Sprint 10 and 12.
- **MCP tools registry** stays optional—only include if it won’t disrupt search/sync/import.

---

## Final Milestones
- **End Sprint 8:** Library-first app + UI Layout Builder shipped
- **End Sprint 9:** Search/filters + Skill simulation + GitHub import MVP shipped
- **End Sprint 10:** Templates + UI Components Builder + repo scan import shipped
- **End Sprint 11:** Packs + UI Page Builder + optional Convex sync shipped
- **End Sprint 12:** Convex full-text search + imported skills editable shipped

