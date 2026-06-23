# Iteration 2: UX & Design Execution Tasks

## Task 2.1: Global CSS & Theme Overhaul
**Objective:** Apply the new sharp, subtle, and highly interactive visual baseline.
**References:** ADR-002

### Action Items
- [ ] **Border Radius:** Update `tailwind.config.ts` and global CSS (shadcn variables) to enforce `--radius: 0` globally.
- [ ] **Cursors:** Add global CSS rule to enforce `cursor: pointer` on all `<button>`, `<a>`, and interactive custom components.
- [ ] **Glow Effects:** Modify the existing button hover CSS variables to reduce the spread and opacity of the box-shadow glow, making it a subtle accent rather than an intense highlight.

## Task 2.2: Layout & Navigation Redesign
**Objective:** Strip away the traditional app shell in favor of a pure canvas.
**References:** ADR-002

### Action Items
- [ ] **Remove Navbar:** Delete the top navigation bar component from the root layout wrapper.
- [ ] **Logout Positioning:** Create a minimal `LogoutButton` component and anchor it fixed to the bottom-center of the main layout (`bottom-4 left-1/2 -translate-x-1/2`).

## Task 2.3: Relative Date Display Component
**Objective:** Implement context-aware, clean metadata rendering.
**References:** ADR-002

### Action Items
- [ ] Create a utility function using `date-fns` to convert timestamps to relative strings ("Today", "Yesterday", "2d", "1w").
- [ ] Build a `DateDisplay` component that renders the relative string by default.
- [ ] Wrap the `DateDisplay` in a native `title` attribute or shadcn Tooltip to reveal the absolute `DD.MM.YYYY` format on hover.

## Task 2.4: Clean List Views
**Objective:** Remove visual clutter from the dashboard and project views.
**References:** ADR-002

### Action Items
- [ ] **Project List:** Remove all edit/delete action buttons from the individual project list items.
- [ ] **Note List:** Remove all edit/delete action buttons from the individual note list items.
- [ ] Apply `DateDisplay` (from Task 2.3) to the metadata section of list items.

## Task 2.5: In-Place Project Editing
**Objective:** Allow seamless renaming of projects directly from the dashboard.
**References:** ADR-002, pm-fe-rules.md

### Action Items
- [ ] Update `ProjectList` items to manage local `isEditing` state.
- [ ] On click, swap the project name `<span>` for an `<input>` field, auto-focusing the text.
- [ ] Implement `onBlur` and `onKeyDown` (Enter) handlers to fire the optimistic update and sync the new name to the backend.

## Task 2.6: In-Place Note Editing (The Canvas)
**Objective:** Convert the detail view into a seamless, auto-saving text editor.
**References:** ADR-002, pm-fe-rules.md

### Action Items
- [ ] Update `NoteDetail` to render the Note Title as a borderless `<input>` and the Note Body as a borderless `<textarea>`.
- [ ] Remove the "Edit" toggle button entirely—the note is *always* in an editable state.
- [ ] Implement debounced autosave: listen for changes in the inputs, optimistically update React Context, and flush to the API backend after ~1000ms of typing inactivity.
