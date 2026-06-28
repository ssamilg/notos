> **PLANNER INSTRUCTION (READ BEFORE MODIFYING TASKS):**
> Before generating or updating the execution checklist below, you MUST scan the `.cursor/rules/` directory. Read the `description` fields inside the `.mdc` files to understand what each rule does.
>
> For every Action Item you create in this document, append a `**Required Rules:**` line listing the exact relative file paths of the `.mdc` files the Dev Agent must read before executing that specific item.
>
> *Example output format:*
> `- [ ] Implement authentication store. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/pinia-state.mdc`

---

# Tasks (Iteration 5): UI/UX Refinements

**Context:** These tasks focus on standardizing the UI primitives, adding safety nets, and optimizing the capture workflow.

---

# Task 5.1: Shared UI Primitives (Dates & Tags)
**Objective:** Update formatting components to match the new visual constraints.
**References:** ADR-005

### Action Items
- [x] Update `DateDisplay` utility to calculate relative times (Today, Yesterday, 2d, 1w, 2mo) and fall back to `DD.MM.YYYY` if older than 3 months.
- [x] Add conditional Tailwind styling to `DateDisplay` to render "Today" in glowing bright white.
- [x] Wrap `DateDisplay` in a native `title` attribute or tooltip to show absolute `DD.MM.YYYY, HH:mm` on hover.
- [x] Create a `TagDisplay` component that receives an array of strings and formats them as `[#tag1, #tag2]` (or `#tag1` for singles).

---

# Task 5.2: The Canvas Save Mechanism (Split-Button)
**Objective:** Build the memory-enabled capture workflow.
**References:** ADR-005, SDD Section 5

### Action Items
- [x] Build a `SaveSplitButton` component with a primary action block and a dropdown chevron block.
- [x] Wire the dropdown to display three options: `Save`, `Save & Exit`, `Save & New Note`.
- [x] Implement `localStorage` syncing: when an option is selected from the dropdown, save the preference key and immediately update the primary button's label and action.
- [x] Wire the respective routing actions (Exit -> return to list; New Note -> clear form/generate new UUID).

---

# Task 5.3: Global Tag Input & Autocomplete
**Objective:** Build a robust, keyboard-friendly tag input.
**References:** ADR-005

### Action Items
- [x] Build a custom `TagInput` component for the Note Canvas.
- [x] Implement keyboard event listeners: `Enter` converts text to a tag, `Backspace` (when input is empty) removes the last tag in the array.
- [x] Integrate a dropdown menu below the input that filters and displays global tags from `useTagsQuery()` based on the current typing string.

---

# Task 5.4: Standardized List Layouts & FE Search
**Objective:** Align Project and Tag lists with explicit edit states and local filtering.
**References:** ADR-005

### Action Items
- [x] Update the `ProjectListItem` and `TagListItem` components to the strict two-row layout.
- [x] Implement local `isEditing` state for these items. Default state shows the `Edit` button. Edit state swaps the name for an input and shows `Save | Cancel | Delete` buttons.
- [x] Add a `SearchInput` component above both lists that locally filters the rendered array based on the `name` property.
- [x] Update `NoteListItem` to render a strikethrough CSS class across the entire row if `is_completed` is true.

---

# Task 5.5: Universal Delete Confirmations
**Objective:** Gate all destructive actions behind a safety modal.
**References:** ADR-005

### Action Items
- [x] Build a reusable `ConfirmationModal` component (using shadcn/ui Dialog if available).
- [x] Wire the modal into the Project List: clicking `Delete` opens the modal; confirming fires `useDeleteProjectMutation`.
- [x] Wire the modal into the Tag List: clicking `Delete` opens the modal with the dynamic warning ("Affects X notes"); confirming fires `useDeleteTagMutation`.
- [x] Wire the modal into the Note Detail/List views for note deletions.
