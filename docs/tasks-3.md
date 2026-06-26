> **PLANNER INSTRUCTION (READ BEFORE MODIFYING TASKS):**
> Before generating or updating the execution checklist below, you MUST scan the `.cursor/rules/` directory. Read the `description` fields inside the `.mdc` files to understand what each rule does.
>
> For every Action Item you create in this document, append a `**Required Rules:**` line listing the exact relative file paths of the `.mdc` files the Dev Agent must read before executing that specific item.
>
> *Example output format:*
> `- [ ] Implement authentication store. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/pinia-state.mdc`

---

# Task 1: Database Schema & Relations Migration
**Objective:** Normalize tags and add task state tracking.
**References:** SDD Section 2, pm-be-rules.md

### Action Items
- [ ] Create Supabase migration to add `is_completed` boolean to `notes` table[cite: 6].
- [ ] Create Supabase migration for `tags` and `note_tags` tables[cite: 6].
- [ ] Apply RLS policies to `tags` and `note_tags` restricting access to `auth.uid() = user_id`[cite: 6].

---

# Task 2: Backend Service Layer Updates
**Objective:** Handle tag many-to-many orchestration and task completion logic.
**References:** pm-be-rules.md, SDD Section 4

### Action Items
- [ ] Update Note Service CRUD methods to handle array of tag strings (lookup/create tags, sync `note_tags` join table inside a transaction)[cite: 6].
- [ ] Create Tag Service for fetching all user tags with counts.
- [ ] Create Tag Service for global deletion.

---

# Task 3: API Layer Search, Filtering & Tags
**Objective:** Expose the new queries and tag management endpoints.
**References:** pm-be-rules.md, SDD Section 3

### Action Items
- [ ] Update `GET /api/v1/notes` to accept `cursor`, `search`, and `tag_id` query params, modifying the Supabase query accordingly[cite: 6].
- [ ] Build Next.js Route Handlers for `GET /api/v1/tags` and `DELETE /api/v1/tags/:id`[cite: 6].
- [ ] Ensure strict input validation for all new query parameters[cite: 6].

---

# Task 4: Frontend State & Infinite Scroll Logic
**Objective:** Orchestrate new data params and pagination in the React Context.
**References:** pm-fe-rules.md, SDD Section 5

### Action Items
- [ ] Update API Service Layer contracts to support `cursor`, `search`, and `tags`[cite: 7].
- [ ] Update React Context to append data for infinite scroll rather than overwriting.
- [ ] Implement client-side sorting logic to push `is_completed` notes to the bottom of the list.

---

# Task 5: UI Primitives & Markdown Integration
**Objective:** Build rendering components for formatting and status.
**References:** pm-fe-rules.md

### Action Items
- [ ] Integrate a lightweight Markdown renderer (e.g., `react-markdown`) as a "Dumb" Presenter component[cite: 7].
- [ ] Build a "View/Edit" toggle component for the Note Detail view to switch between rendered Markdown and raw textarea.
- [ ] Update list item UI primitives to apply a strikethrough visual treatment if `is_completed` is true.
- [ ] Ensure all inputs have proper Tab indexing (`tabIndex`) for keyboard-only navigation.

---

# Task 6: Global Tag Manager Interface
**Objective:** Build the global tag deletion interface with warnings.
**References:** pm-fe-rules.md

### Action Items
- [ ] Build `TagList` presenter component showing tag names and note counts[cite: 7].
- [ ] Build a confirmation modal ("Are you sure? This affects X notes") for the delete action.
- [ ] Wire the Tag Manager container to the global state and API service[cite: 7].
- [ ] Tag manager interface would be at same level as the project list and it will be a tab view next to the projects.

---

# Task 7: Note Dashboard Enhancements
**Objective:** Implement infinite scroll, filtering, and quick actions.
**References:** pm-fe-rules.md

### Action Items
- [ ] Add a search input and tag dropdown filter to the `ProjectDashboard` route via URL parameters[cite: 7].
- [ ] Implement `IntersectionObserver` (or similar) on the note list to trigger infinite scroll fetch requests.
- [ ] Add "Save & Exit" and "Save & New Note" action buttons to the Note Detail / Canvas view[cite: 7].