# Sprint 7 — Track B Detailed Plan
## UI Prompt Builder (Aura-like) — Scaffolding + Spec Bridge

**Track B goal for Sprint 7:** Establish the **UI Prompt Builder module architecture** and ship a minimal but real workflow:
- define UI intent via `UiPromptSpec`
- generate a usable prompt via `UiPromptSpec → PromptSpec`
- save the generated prompt into the Prompt Library

> Sprint 7 is **not** about building full UI previews or rich Layout/Styling builders (those start Sprint 8). It’s about getting the rails in place so Layout/Styling/Components can ship quickly next.

---

## 1) Outcomes (what users can do after Sprint 7)
- Navigate to **Create → UI Prompt Builder**
- Choose a builder type (Layout / Styling / Components / Page)
- Fill a small set of fields (MVP knobs)
- See generated prompt output (via existing prompt exporter UI)
- Save the result as a Prompt library item with `ui` tags

---

## 2) UX Deliverables (screens & flows)

### B1. UI Builder Landing Page
**Route:** `/create/ui`

**Content**
- Page title: “UI Prompt Builder”
- Builder cards (clickable):
  - Layout Builder (MVP: minimal form)
  - Styling Builder (MVP: minimal form)
  - Components Builder (MVP: minimal form)
  - Page/Screen Builder (placeholder or minimal)

**Each card shows**
- Short description
- Output type (Prompt)
- “Start” button

**Acceptance Criteria**
- Landing is discoverable from global nav and links to builder routes.

---

### B2. UI Builder “Scaffold Form” Page (shared)
**Route:** `/create/ui/:builderType` (builderType = layout|styling|components|page)

**Layout**
- Left: form controls (MVP knobs)
- Right: generated prompt preview + export actions
  - Reuse existing Prompt Export panel from Track A (if exists)
  - Or show “Prompt Preview” textbox + Copy

**MVP knobs by builder type**
- **Layout (MVP knobs)**
  - page pattern: dashboard / list-detail / settings / wizard
  - navigation: sidebar / top nav / tabs
  - responsiveness: mobile-first / desktop-first
  - data presentation: table / cards / mixed
- **Styling (MVP knobs)**
  - vibe: minimal / modern / playful
  - theme: light / dark / system
  - density: compact / comfortable
- **Components (MVP knobs)**
  - components list (multi-select): table, form, dialog, tabs, command palette
  - interactions: create/edit/delete, filter/search
- **Page (MVP knobs)**
  - screen name
  - route/path
  - core actions list (e.g., create/edit/delete)
  - output contract: full files vs patch diff (just influences prompt text in Sprint 7)

**Actions**
- “Generate” (optional if live updates; but explicit is fine for MVP)
- “Save to Library” (creates prompt item)
- “Copy for Codex” (or generic “Copy prompt” in Sprint 7)

**Acceptance Criteria**
- Switching a knob changes generated prompt deterministically.
- Save creates a prompt in the Prompt Library with tags.

---

## 3) Spec & Bridge Design

### B3. `UiPromptSpec` schema (v1)
```ts
type UiBuilderType = "layout" | "styling" | "components" | "page";

type UiPromptSpec = {
  builderType: UiBuilderType;
  title: string;                  // generated from builder type + key choices
  stack: {
    framework?: "nextjs" | "react" | "vite" | "other";
    uiLib?: "shadcn" | "mui" | "chakra" | "other";
    styling?: "tailwind" | "css" | "other";
  };
  layout?: {
    pagePattern?: "dashboard" | "list-detail" | "settings" | "wizard";
    navigation?: "sidebar" | "top-nav" | "tabs";
    responsiveness?: "mobile-first" | "desktop-first";
    dataPresentation?: "table" | "cards" | "mixed";
  };
  styling?: {
    vibe?: "minimal" | "modern" | "playful";
    theme?: "light" | "dark" | "system";
    density?: "compact" | "comfortable";
  };
  components?: {
    selected: string[];           // e.g., ["datatable", "dialog"]
    interactions?: string[];      // e.g., ["create", "edit", "search"]
  };
  page?: {
    screenName?: string;
    route?: string;
    actions?: string[];
    outputMode?: "full-files" | "patch-diff";
  };
  requirements?: {
    a11y?: boolean;
    states?: boolean;             // loading/empty/error
    tests?: boolean;
  };
};
```

### B4. Bridge: `UiPromptSpec → PromptSpec` (v1)
Create a deterministic mapper:
- Prompt goal = derived from `builderType` and top-level choices
- Context = includes stack conventions (shadcn + tailwind)
- Constraints = a11y/states/test requirements (if toggled)
- Output contract = derived from `outputMode` and builder type

**Example output structure**
- Title: “UI Layout Prompt — List/Detail with Sidebar”
- Prompt body sections:
  1) Objective
  2) Tech stack constraints
  3) UI requirements (layout/styling/components)
  4) States + accessibility
  5) Output contract

**Acceptance Criteria**
- For the same UiPromptSpec, the generated prompt text is stable.

---

## 4) Persistence & Library Integration

### B5. Saving UI prompts
When user clicks “Save to Library”:
- Create `LibraryItem(type="prompt")`
- Title = UiPromptSpec.title
- Tags include:
  - `ui`
  - builder type tag (`ui:layout`, `ui:styling`, etc.)
  - stack tags (`shadcn`, `tailwind`, etc.)
- Save the UiPromptSpec inside the PromptSpec content (or as metadata) so it’s recoverable later.

**Acceptance Criteria**
- Reopening the saved prompt shows the original generated prompt content.

---

## 5) Implementation Plan (tasks)

### B6. Routes + nav
- Add “Create” section and UI builder entry
- Routes:
  - `/create/ui`
  - `/create/ui/layout`
  - `/create/ui/styling`
  - `/create/ui/components`
  - `/create/ui/page`

### B7. Component architecture
- `UiBuilderLanding`
- `UiBuilderScaffold` (shared page)
  - uses `builderType` param
  - renders a `UiSpecForm(builderType)`
  - renders `PromptPreviewPanel(promptSpec)` on the right

### B8. Export panel reuse
If Track A includes `ExportPanel` for prompts:
- Reuse it here for consistency.

If not:
- Provide “Copy Prompt” for Sprint 7.

---

## 6) Risks & scope guards
- **Risk:** Overbuilding UI preview now  
  **Guard:** No wireframe preview in Sprint 7; only prompt output.

- **Risk:** Too many knobs makes MVP slow  
  **Guard:** Keep 3–5 knobs per builder type.

- **Risk:** Prompt builder/export panel dependency  
  **Guard:** If export panel isn’t ready, use a simple copy textarea.

---

## 7) Definition of Done (Track B)
Track B is done when:
- UI Prompt Builder module is discoverable and navigable,
- `UiPromptSpec` exists and is persisted in generated prompt items,
- The bridge produces stable PromptSpec output,
- Users can save generated UI prompts into the library for later reuse.
