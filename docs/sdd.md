# System Design Document (SDD)
**Feature / Project:** NOTOS Core Application
**Author:** PM Agent
**Date:** 23-06-2026

## 1. System Architecture
- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui[cite: 5]
- **Backend:** Next.js Route Handlers (`app/api`)[cite: 5]
- **Database:** Supabase (PostgreSQL)[cite: 5]
- **Core Pattern:** Offline-First SPA with background syncing to REST API[cite: 1].

## 2. Database Schema (Data Access Layer)

### `projects`
- `id`: UUID (Primary Key, Default: `uuid_generate_v4()`)
- `user_id`: UUID (FK to `auth.users`, Required)
- `name`: Text (Required)[cite: 1]
- `created_at`: Timestampz (Default: `now()`)[cite: 1]
- `updated_at`: Timestampz (Default: `now()`)[cite: 1]
- `deleted_at`: Timestampz (Nullable)[cite: 1]

### `notes`
- `id`: UUID (Primary Key, Default: `uuid_generate_v4()`)
- `project_id`: UUID (FK to `projects.id`, Required)[cite: 1]
- `user_id`: UUID (FK to `auth.users`, Required)
- `title`: Text (Required)[cite: 1]
- `text`: Text (Required)[cite: 1]
- `tag`: Text (Nullable)[cite: 1]
- `created_at`: Timestampz (Default: `now()`)[cite: 1]
- `updated_at`: Timestampz (Default: `now()`)[cite: 1]
- `deleted_at`: Timestampz (Nullable)[cite: 1]

## 3. API Contract (API Layer)
*Standard Envelope:* `{ "data": any, "error": string | null, "meta": any, "request_id": string }`[cite: 6]

### GET /api/v1/projects
- **Purpose:** Fetches all active projects for authenticated user.
- **Auth Required:** Yes

### POST /api/v1/projects
- **Purpose:** Creates a new project.
- **Auth Required:** Yes

### PUT /api/v1/projects/:id
- **Purpose:** Updates project (or applies soft delete).
- **Auth Required:** Yes

### GET /api/v1/notes?projectId=X
- **Purpose:** Fetches notes for a specific project.
- **Auth Required:** Yes

### POST /api/v1/notes
- **Purpose:** Creates a new note.
- **Auth Required:** Yes

### PUT /api/v1/notes/:id
- **Purpose:** Updates note (or applies soft delete).
- **Auth Required:** Yes

## 4. Business Logic (Service Layer)
- **Default Provisioning:** On a new user's first login, the system must automatically provision a "Default" project[cite: 1].
- **Soft Deletion:** DELETE HTTP requests are mapped to PUT requests updating the `deleted_at` column[cite: 1]. 
- **Cron Cleanup:** `pg_cron` script runs to permanently flush records where `deleted_at` is older than X days[cite: 1].

## 5. Frontend State & Data Flow
- **Client State:** React Context acts as the single source of truth for the UI[cite: 5, 7].
- **Persistence:** React Context state is mirrored asynchronously to IndexedDB.
- **Sync Queue:** Mutations (Create/Update/Delete) update Context immediately (Optimistic UI), then queue a background fetch request to the Next.js API[cite: 1, 4].

## 6. Security & Infrastructure
- **Authentication:** Supabase Auth (OAuth / Magic Link)[cite: 5].
- **Authorization:** Supabase Row Level Security (RLS) policies enforcing data isolation[cite: 1, 5]. Edge middleware protects `/api` routes[cite: 5].