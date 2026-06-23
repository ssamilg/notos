# Task 1: Database Schemas, RLS & Migrations
**Objective:** Establish the foundational data layer and secure it.
**References:** SDD Section 2 & 6, pm-be-rules.md

### Action Items
- [ ] Create Supabase migration for `projects` and `notes` tables[cite: 5].
- [ ] Apply RLS policies to restrict SELECT, INSERT, UPDATE, DELETE to authenticated users[cite: 1].
- [ ] Create database seed script for local testing[cite: 6].

---

# Task 2: Background Cron Job Setup
**Objective:** Implement the soft-delete lifecycle management.
**References:** PRD Requirements, SDD Section 4

### Action Items
- [ ] Write SQL migration to enable `pg_cron` extension.
- [ ] Define scheduled job to permanently delete `projects` and `notes` where `deleted_at` is older than X days[cite: 1].

---

# Task 3: Backend Data Access & Service Layer
**Objective:** Build the internal business logic before exposing it to the web.
**References:** pm-be-rules.md, SDD Section 4

### Action Items
- [ ] Create typed Supabase client utility for the server[cite: 5].
- [ ] Implement Service methods for Project CRUD and Note CRUD[cite: 1].
- [ ] Implement user initialization logic (create "Default" project if user has 0 projects)[cite: 1].

---

# Task 4: API Layer Construction
**Objective:** Expose the Service layer via standard HTTP contracts.
**References:** pm-be-rules.md, SDD Section 3

### Action Items
- [ ] Build Next.js Route Handlers (`app/api/v1/projects` and `app/api/v1/notes`)[cite: 5, 6].
- [ ] Implement standard response envelope (`data`, `error`, `meta`, `request_id`)[cite: 6].
- [ ] Build Auth Middleware to validate Supabase JWT on all protected endpoints[cite: 6].

---

# Task 5: Frontend State & IndexedDB Architecture
**Objective:** Establish the offline-first core for zero-latency UI.
**References:** pm-fe-rules.md, PRD Requirements

### Action Items
- [ ] Set up `localforage` (IndexedDB wrapper) instance.
- [ ] Build React Context providers for `ProjectState` and `NoteState`[cite: 5].
- [ ] Implement synchronization queue logic (optimistic update -> background API call -> resolve temporary IDs)[cite: 1, 4].

---

# Task 6: UI Theme & Global Layout
**Objective:** Implement the ultra-modern visual standard.
**References:** Wireframes, Tech Stack

### Action Items
- [ ] Configure Tailwind config for high-contrast pure black (`#000000`) and glowing white variables[cite: 1, 3].
- [ ] Build shared UI primitives (Buttons, Inputs, glowing borders) as "Dumb" Presenter components[cite: 7].
- [ ] Scaffold root layout and protected route wrappers.

---

# Task 7: Landing & Authentication View
**Objective:** Build View 1.
**References:** Wireframes (View 1)

### Action Items
- [ ] Build Landing presentational component[cite: 3].
- [ ] Wire Supabase Auth UI / Magic Link login[cite: 5].
- [ ] Handle redirect to Project Dashboard post-auth.

---

# Task 8: Project Dashboard
**Objective:** Build View 2 with strict empty/loading states.
**References:** Wireframes (View 2), pm-fe-rules.md

### Action Items
- [ ] Build `ProjectList` presenter component[cite: 7].
- [ ] Build `ProjectDashboard` container component connecting to React Context[cite: 7].
- [ ] Implement "Create Project" action (optimistic UI update)[cite: 1].
- [ ] Implement Loading, Error, and Empty states for this view[cite: 7].

---

# Task 9: Note List & Detail Views
**Objective:** Build Views 3 & 4.
**References:** Wireframes (View 3 & 4)

### Action Items
- [ ] Build `NoteList` and `NoteDetail` presenter components[cite: 3, 7].
- [ ] Map Next.js URL parameters to local view state[cite: 7].
- [ ] Wire deletion logic (optimistic UI removal, background API PUT for soft-delete)[cite: 1].
- [ ] Implement Loading, Error, and Empty states[cite: 7].

---

# Task 10: The Canvas (Add/Edit Mode)
**Objective:** Build the distraction-free View 5.
**References:** Wireframes (View 5), PRD User Stories

### Action Items
- [ ] Build full-screen `Canvas` presentational component with transparent inputs[cite: 3].
- [ ] Implement autosave logic tied to Context state.
- [ ] Ensure seamless keyboard handling and input focus for mobile views[cite: 3].