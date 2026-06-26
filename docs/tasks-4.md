# Tasks (Iteration 4): Architectural Rewrite

**Context:** These tasks focus strictly on ripping out the bloated custom state wrappers and replacing them with React Query and Client-Generated IDs.

---

# Task 4.1: Codebase Cleanup & Dependency Setup
**Objective:** Prepare the frontend for the new state paradigm.
**References:** ADR-004

### Action Items
- [x] Install `@tanstack/react-query` and configure the `QueryClientProvider` at the application root. **Required Rules:** .cursor/rules/nextjs.mdc, .cursor/rules/typescript.mdc, .cursor/rules/refactoring.mdc
- [x] Delete all legacy React Context files (`ProjectProvider`, `NoteProvider`, `TagProvider`, `NavigationProvider`). **Required Rules:** .cursor/rules/refactoring.mdc, .cursor/rules/clean-code.mdc
- [x] Delete the custom `localforage` wrapper utilities used for manual IndexedDB syncing. **Required Rules:** .cursor/rules/refactoring.mdc, .cursor/rules/performance.mdc

---

# Task 4.2: API Layer Refactoring (Client IDs)
**Objective:** Update the backend to accept client-generated primary keys.
**References:** SDD Section 3 & 4

### Action Items
- [x] Update POST `app/api/v1/projects` validation to require an `id` (UUIDv4) string from the client body. **Required Rules:** .cursor/rules/typescript.mdc, .cursor/rules/clean-code.mdc
- [x] Update POST `app/api/v1/notes` validation to require an `id` (UUIDv4) string from the client body. **Required Rules:** .cursor/rules/typescript.mdc, .cursor/rules/clean-code.mdc
- [x] Ensure Supabase insertion logic uses these provided IDs instead of relying on database auto-generation. **Required Rules:** .cursor/rules/typescript.mdc, .cursor/rules/nextjs.mdc
- [x] Map unique constraint violations to standard HTTP 409 Conflict errors. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/typescript.mdc

---

# Task 4.3: Query Layer Implementation (Data Fetching)
**Objective:** Replace context-based rendering with standard React Query hooks.
**References:** ADR-004

### Action Items
- [x] Create custom hook `useProjectsQuery()` wrapping `useQuery` to fetch the project list. **Required Rules:** .cursor/rules/performance.mdc, .cursor/rules/typescript.mdc, .cursor/rules/clean-code.mdc
- [x] Create custom hook `useNotesInfiniteQuery(projectId)` wrapping `useInfiniteQuery` to fetch the paginated notes list. **Required Rules:** .cursor/rules/performance.mdc, .cursor/rules/typescript.mdc
- [x] Create custom hook `useTagsQuery()` for tag manager data. **Required Rules:** .cursor/rules/performance.mdc, .cursor/rules/typescript.mdc
- [x] Update `ProjectDashboard`, `TagManager`, and project page components to consume these hooks. **Required Rules:** .cursor/rules/nextjs.mdc, .cursor/rules/clean-code.mdc

---

# Task 4.4: Mutation Layer Implementation (Optimistic UI)
**Objective:** Re-implement optimistic creation and editing with native React Query features.
**References:** SDD Section 5

### Action Items
- [x] Create `useCreateNoteMutation()` and `useCreateProjectMutation()`. **Required Rules:** .cursor/rules/typescript.mdc, .cursor/rules/performance.mdc
- [x] Inside these hooks, implement the `onMutate` callback with client `crypto.randomUUID()`, cache injection, and rollback context. **Required Rules:** .cursor/rules/refactoring.mdc, .cursor/rules/clean-code.mdc
- [x] Implement the `onError` callback to restore the previous cache state and trigger a UI toast notification. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/nextjs.mdc
- [x] Create matching mutation hooks for Updates and Deletes (projects, notes, tags). **Required Rules:** .cursor/rules/typescript.mdc, .cursor/rules/refactoring.mdc

---

# Task 4.5: UI Re-wiring & Validation
**Objective:** Connect the new hooks to the presentation layer and ensure the reversion UX works.
**References:** SDD Section 5

### Action Items
- [x] Ensure that if a mutation fails, the form input fields do NOT clear or reset, allowing the user to copy/recover their work. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/nextjs.mdc
- [x] Remove NavigationOverlay, sync queue UI, and IndexedDB dependencies; use `queryClient.clear()` on logout. **Required Rules:** .cursor/rules/refactoring.mdc, .cursor/rules/performance.mdc
- [x] Hard-refresh lifecycle rebuilds state from API only (no IndexedDB). **Required Rules:** .cursor/rules/performance.mdc, .cursor/rules/nextjs.mdc
