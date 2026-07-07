> **PLANNER INSTRUCTION (READ BEFORE MODIFYING TASKS):**
> Before generating or updating the execution checklist below, you MUST scan the `.cursor/rules/` directory. Read the `description` fields inside the `.mdc` files to understand what each rule does.
>
> For every Action Item you create in this document, append a `**Required Rules:**` line listing the exact relative file paths of the `.mdc` files the Dev Agent must read before executing that specific item.
>
> *Example output format:*
> `- [ ] Implement authentication store. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/pinia-state.mdc`

---

# Task 1: Note Detail Layout & Aesthetic Shift
**Objective:** Implement the new structural layout, breadcrumbs, and subtle borders without altering existing state logic.
**References:** ADR-007, Wireframe

### Action Items
- [ ] Refactor `NoteDetail` layout into a two-column grid: main content (left) and fixed action menu (right). Add the subtle corner border styling to the main content wrapper using Tailwind.
- [ ] Remove the standalone "Back" button and large `h1` Note Title.
- [ ] Implement `BreadcrumbHeader` (monospace format: `← [Project Name] / [Note Title]`). Wire the project name as a router `Link` back to the list.
- [ ] Move the `TagDisplay` directly below the breadcrumbs, ensuring glowing text styling.
- [ ] Move `MARK DONE`, `EDIT`, `SAVE` (Split-Button), and `DELETE` into the right-aligned column.
- [ ] **CRITICAL DEV NOTE:** The wireframe shows `EDIT` and `SAVE` simultaneously for structural reference only. You MUST retain the existing `isEditing` logic. Only render `EDIT` when in View Mode; only render the `SAVE` split-button when in Edit Mode. Do not rewrite the in-place editing functionality (labels turning to inputs).

---

# Task 2: Keyboard Accessibility (Tab Indexing)
**Objective:** Sequence the keyboard focus flow to support rapid capture.
**References:** ADR-007

### Action Items
- [ ] Apply explicit `tabIndex` attributes to the interactive elements within the Edit Mode of the Note Canvas.
- [ ] Set `tabIndex={1}` on the Breadcrumb Note Title input.
- [ ] Set `tabIndex={2}` on the Tags Input component.
- [ ] Set `tabIndex={3}` on the main Markdown Content Textarea.
- [ ] Set `tabIndex={4}` on the Save Button (primary action).
- [ ] Ensure focus automatically jumps to the Note Title input (`tabIndex={1}`) when the user transitions into Edit Mode.

---

# Task 3: Default Markdown Seeding & View State
**Objective:** Improve the empty state for new notes and manage the initial visit state.
**References:** ADR-007, SDD Section 5

### Action Items
- [ ] Create `src/constants/templates.ts` exporting a `DEFAULT_NOTE_TEMPLATE` string containing sample Markdown (e.g., an H1 header, a bulleted list, and bold text).
- [ ] Update the UI action that triggers `useCreateNoteMutation`. If the user is creating a generic new note, pass `DEFAULT_NOTE_TEMPLATE` as the `text` payload instead of `""`.
- [ ] Update the `NoteDetail` component initialization logic. Ensure that when navigating to a note, `isEditing` defaults to `false` (View Mode) so the user immediately sees the rendered Markdown template.

---

# Task 4: Bug Fix - Offline-First "Mark Done"
**Objective:** Ensure the completion toggle and note save correctly follows the optimistic UI pattern.
**References:** UX Feedback Log, SDD Section 5

### Action Items
- [ ] Locate the `useUpdateNoteMutation` hook (or the specific handler for marking notes as done).
- [ ] Implement or fix the `onMutate` callback to synchronously update the `is_completed` boolean for the specific note ID in the React Query cache (`queryClient.setQueryData`).
- [ ] Ensure `onError` correctly rolls back this cache update if the backend request fails.
- [ ] Verify in the UI that clicking "Mark Done" instantly triggers the strikethrough effect with zero network latency.