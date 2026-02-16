# Sprint 7 — Overall Plan (Tracks A+B+E+F)

**Sprint theme:** *Library-first foundation + Skill Builder MVP + UI Builder scaffolding*  
**Goal:** By end of Sprint 7, PRMPT feels like an organizer (not a demo) and users can **create, save, find, and reopen Skills** from a dedicated Library. In parallel, we establish the **UI Prompt Builder module** architecture and a working `UiPromptSpec → PromptSpec` bridge (so UI builders can piggyback on existing exporters and library storage).

---

## 1) Sprint 7 Objectives (what “done” means)

### Primary outcomes (must ship)
1. **Library Dashboard** becomes the default “home” experience:
   - Recents, Favorites, Continue
   - Quick create (Prompt / Skill)
   - Entry to Search (even if search is basic in Sprint 7)

2. **Skills Library is end-to-end**:
   - List view → detail view → edit → save → reopen
   - Metadata v1: tags, targets, status, lastUsedAt
   - Export v1: at least 1 target format (Claude-style markdown)

3. **UI Prompt Builder scaffolding exists**:
   - Create → UI Prompt Builder landing page
   - `UiPromptSpec` model + defaults
   - A bridge `UiPromptSpec → PromptSpec` that produces a valid prompt output view
   - The UI builder can **save** a generated prompt as a Prompt library item (even if only via bridge and basic UI)

### Secondary outcomes (nice to have if time)
- Command palette skeleton (Cmd+K opens modal; actions may be minimal)
- “Import (GitHub URL)” entry point appears in Skills Library but is disabled / “coming soon”
- Basic bulk actions in skills list (favorite, archive)

---

## 2) In-scope Deliverables (Sprint 7)

### UX / Screens
- **Library Dashboard (new)**
  - Sections: Continue, Recents, Favorites
  - Quick actions: New Prompt, New Skill
  - Recent activity should update on open/save

- **Skills Library (new)**
  - Skills list (grid or table)
  - Skill detail page (overview + content + export)
  - Skill editor (MVP: structured form or tabbed editor)

- **UI Prompt Builder (new module shell)**
  - Landing page with builder cards (Layout/Styling/Components/Page)
  - Basic “generate prompt” view powered by bridge

### Data / Models
- `LibraryItem` (unified wrapper)
- `SkillSpec` (structured skill data)
- `UiPromptSpec` (structured UI prompt data)
- `Collection` + `Version` stubs (optional scaffolding only)

### Persistence
- Local-first store with a stable API:
  - `library.list(type?)`
  - `library.get(id)`
  - `library.upsert(item)`
  - `library.delete(id)`
  - `library.touchLastUsed(id)`

---

## 3) Out of scope (Sprint 7)
- Convex sync/auth (begins Sprint 11 in our roadmap)
- GitHub skill import functionality (begins Sprint 9)
- Full-text search (Sprint 9+; basic search entry only now)
- Rich “preview” for UI builder (wireframe preview begins Sprint 8 with Layout Builder MVP)
- Collections/packs UI (Sprint 11)

---

## 4) Acceptance Criteria (Sprint 7)

### Organizer baseline
- [ ] Opening the app lands on **Library Dashboard**.
- [ ] Creating a Skill from “New Skill” saves a **LibraryItem(type=skill)**.
- [ ] The Skills list shows the newly created Skill, and opening it loads the saved content.
- [ ] Saving updates `updatedAt`; opening updates `lastUsedAt`.
- [ ] Items can be favorited and show up in the Favorites section.

### Skill Builder MVP
- [ ] Skill Editor supports:
  - name, description
  - inputs (simple list)
  - steps (ordered list)
  - outputs (expected artifacts)
  - verification checklist (optional but supported)
- [ ] Export v1 produces a deterministic markdown output (at minimum “Claude-style” `SKILL.md` content).
- [ ] Export is copyable (copy-to-clipboard) and/or downloadable.

### UI Builder scaffolding
- [ ] UI Prompt Builder landing page is reachable via Create.
- [ ] User can select a UI builder card and produce a prompt output via bridge.
- [ ] The resulting prompt can be saved into the Prompt Library (basic tags applied, e.g., `ui`).

---

## 5) Sprint 7 Release Checklist
- [ ] Smoke test: create/edit/save/reopen skill
- [ ] Verify Recents + Favorites update correctly
- [ ] Verify exports copy correctly
- [ ] Verify local storage migration doesn’t wipe existing data (if applicable)
- [ ] Verify UI builder bridge generates valid PromptSpec output

---

## 6) Suggested Engineering Breakdown (high-level)

### Frontend (React/shadcn)
- Routes:
  - `/library` (dashboard)
  - `/library/skills`
  - `/library/skills/:id`
  - `/create/skill` (new)
  - `/create/ui` (landing)
  - `/create/ui/:builderType` (scaffold)
- Shared UI components:
  - `LibraryHeader` (search entry, create buttons)
  - `ItemCard` / `ItemRow`
  - `MetadataEditor` (tags, targets, status)
  - `ExportPanel` (copy/download)

### State/Storage
- `libraryStore` abstraction
- `useLibraryQuery` hooks (even local-first, keep it query-ish for future Convex)

---

## 7) Risks & Mitigations
- **Risk:** Overbuilding the library model too early  
  **Mitigation:** Keep schema minimal; avoid collections/versioning UI in Sprint 7.

- **Risk:** Skill editor scope creep  
  **Mitigation:** Ship a simple structured editor first; richer lint/simulate later.

- **Risk:** UI Builder distracts from library  
  **Mitigation:** UI Builder in Sprint 7 is scaffolding + bridge only; preview comes Sprint 8.

---

## 8) Definition of Done (Sprint 7)
Sprint 7 is complete when:
- Users can **organize and manage Skills** in the library (create → save → reopen → export),
- The app feels library-first (dashboard + recents/favorites),
- The UI Prompt Builder module exists (landing + `UiPromptSpec → PromptSpec` bridge) and can save prompt items.
