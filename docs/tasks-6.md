> **PLANNER INSTRUCTION (READ BEFORE MODIFYING TASKS):**
> Before generating or updating the execution checklist below, you MUST scan the `.cursor/rules/` directory. Read the `description` fields inside the `.mdc` files to understand what each rule does.
>
> For every Action Item you create in this document, append a `**Required Rules:**` line listing the exact relative file paths of the `.mdc` files the Dev Agent must read before executing that specific item.
>
> *Example output format:*
> `- [ ] Implement authentication store. **Required Rules:** .cursor/rules/clean-code.mdc, .cursor/rules/pinia-state.mdc`

---

# Task 1: Turborepo & Workspace Initialization
**Objective:** Scaffold the monorepo architecture and configure pipelines.
**References:** ADR-006

### Action Items
- [ ] Initialize Turborepo with `apps/api`, `apps/web`, and `packages/shared`.
- [ ] Configure `turbo.json` for build, lint, and dev task orchestration.
- [ ] Set up `packages/shared` with `zod` and export centralized validation schemas for Projects, Notes, and Tags.

---

# Task 2: Backend Scaffold & Security Middleware
**Objective:** Establish the Express server and secure it.
**References:** pm-be-rules.md, SDD Section 6

### Action Items
- [ ] Scaffold Node + Express application in `apps/api`.
- [ ] Configure `cors` middleware to whitelist the Vite development port.
- [ ] Implement `authMiddleware.ts` to extract and validate Supabase JWTs from `Authorization: Bearer` headers.
- [ ] Implement global error handling middleware to catch and standardize Zod validation and domain errors.

---

# Task 3: Backend Data Access & Service Layer
**Objective:** Migrate domain logic to the standalone Node environment.
**References:** pm-be-rules.md, SDD Section 4

### Action Items
- [ ] Configure Supabase client in `apps/api` to execute queries under the authenticated user's context.
- [ ] Implement Project Service layer (CRUD, Soft Delete logic).
- [ ] Implement Note Service layer (CRUD, Transactional Tag Orchestration).
- [ ] Implement Tag Service layer (Aggregations, Global Deletion).

---

# Task 4: Backend API Routing Layer
**Objective:** Bind Express routes to Services and Shared Schemas.
**References:** pm-be-rules.md, SDD Section 3

### Action Items
- [ ] Build Express controllers for `/api/v1/projects`. Validate incoming bodies using `packages/shared` Zod schemas.
- [ ] Build Express controllers for `/api/v1/notes` handling cursor queries and client-provided UUIDs.
- [ ] Build Express controllers for `/api/v1/tags`.
- [ ] Wrap all controller responses in the standardized `{ data, error, meta, request_id }` envelope.

---

# Task 5: Frontend Scaffold & API Client
**Objective:** Set up the Vite application and connectivity.
**References:** pm-fe-rules.md, SDD Section 1 & 5

### Action Items
- [ ] Scaffold React + Vite application in `apps/web`.
- [ ] Configure Tailwind CSS adhering to the strict black/white glowing aesthetic (border-radius: 0).
- [ ] Create an Axios (or Fetch) interceptor to automatically attach the Supabase JWT Bearer token to all outbound `/api/v1` requests.
- [ ] Install and configure `@tanstack/react-query` and `@tanstack/query-persist-client-core` (IndexedDB).

---

# Task 6: Frontend State Hooks Migration
**Objective:** Connect React Query to the new Express endpoints.
**References:** pm-fe-rules.md, SDD Section 5

### Action Items
- [ ] Build `useProjectsQuery` and `useTagsQuery` utilizing the configured API client.
- [ ] Build `useNotesInfiniteQuery` to handle cursor-based pagination.
- [ ] Build mutation hooks (`useCreateNoteMutation`, etc.) with `onMutate` injecting client-generated `crypto.randomUUID()` values for optimistic rendering, utilizing `packages/shared` schemas for pre-flight validation.

---

# Task 7: Frontend Presentational Primitives
**Objective:** Re-implement standardized visual components in the Vite app.
**References:** pm-fe-rules.md

### Action Items
- [ ] Migrate `DateDisplay` component (Relative dates + absolute hover).
- [ ] Migrate `TagDisplay` component (`[#tag1, #tag2]`).
- [ ] Rebuild the standardized two-row List Item layout (`Name | Edit Btn` over `Stats | Date`).
- [ ] Rebuild the `SaveSplitButton` persisting preferences to `localStorage`.

---

# Task 8: Frontend Feature Containers & Routing
**Objective:** Wire UI components to state and route structure.
**References:** pm-fe-rules.md

### Action Items
- [ ] Implement React Router (or equivalent) for navigating between Dashboard, Project View, and Note Detail View.
- [ ] Wire the `ConfirmationModal` state to gate all destructive mutations globally.
- [ ] Re-implement the Note Detail Canvas with the View (Markdown)/Edit (Raw) toggle.
- [ ] Verify infinite scroll `IntersectionObserver` triggers the React Query `fetchNextPage` function smoothly.