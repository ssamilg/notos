# System Design Document (SDD)
**Feature / Project:** NOTOS Core Application
**Author:** PM Agent
**Created:** 23-06-2026
**Last Updated:** 06-07-2026

## 1. System Architecture
- **Frontend (`apps/web`):** React, Vite, Tailwind CSS, React Query (TanStack)
- **Backend (`apps/api`):** Node.js, Express, TypeScript
- **Shared (`packages/shared`):** TypeScript Interfaces, Zod Schemas
- **Database:** Supabase (PostgreSQL)
- **Core Pattern:** Offline-First SPA with React Query caching, syncing to a discrete REST API.

## 2. Database Schema (Data Access Layer)

### `projects`
- `id`: UUID (Primary Key, Client-Generated)
- `user_id`: UUID (FK to `auth.users`, Required)
- `name`: Text (Required)
- `created_at`: Timestampz (Default: `now()`)
- `updated_at`: Timestampz (Default: `now()`)
- `deleted_at`: Timestampz (Nullable)

### `notes`
- `id`: UUID (Primary Key, Client-Generated)
- `project_id`: UUID (FK to `projects.id`, Required)
- `user_id`: UUID (FK to `auth.users`, Required)
- `title`: Text (Required)
- `text`: Text (Required)
- `is_completed`: Boolean (Default: `false`)
- `created_at`: Timestampz (Default: `now()`)
- `updated_at`: Timestampz (Default: `now()`)
- `deleted_at`: Timestampz (Nullable)

### `tags`
- `id`: UUID (Primary Key, Default: `uuid_generate_v4()`)
- `user_id`: UUID (FK to `auth.users`, Required)
- `name`: Text (Required, Unique per user)
- `created_at`: Timestampz (Default: `now()`)

### `note_tags` (Join Table)
- `note_id`: UUID (FK to `notes.id`, Required)
- `tag_id`: UUID (FK to `tags.id`, Required)
- Primary Key: (`note_id`, `tag_id`)

## 3. API Contract (API Layer)
*Standard Envelope:* `{ "data": any, "error": string | null, "meta": any, "request_id": string }`

### GET /api/v1/projects
- **Purpose:** Fetches all active projects for the authenticated user.
- **Auth Required:** Yes

### POST /api/v1/projects
- **Purpose:** Creates a new project (Accepts Client UUID).
- **Auth Required:** Yes

### PUT /api/v1/projects/:id
- **Purpose:** Updates project (or applies soft delete).
- **Auth Required:** Yes

### GET /api/v1/notes
- **Purpose:** Fetches notes with cursor pagination, search, and tag filters.
- **Request Parameters:** `projectId` (UUID), `cursor` (Timestampz, optional), `search` (Text, optional), `tag_id` (UUID, optional)
- **Auth Required:** Yes

### POST /api/v1/notes
- **Purpose:** Creates a new note (Accepts Client UUID) and links tags.
- **Auth Required:** Yes

### PUT /api/v1/notes/:id
- **Purpose:** Updates note, completion state, and orchestrates `note_tags`.
- **Auth Required:** Yes

### GET /api/v1/tags
- **Purpose:** Fetches global tags with aggregated note counts.
- **Auth Required:** Yes

### DELETE /api/v1/tags/:id
- **Purpose:** Globally deletes a tag.
- **Auth Required:** Yes

## 4. Business Logic (Service Layer)
- **Default Provisioning:** On a new user's first login, the system must automatically provision a "Default" project.
- **Soft Deletion:** DELETE HTTP requests are mapped to PUT requests updating the `deleted_at` column.
- **Cron Cleanup:** `pg_cron` script runs to permanently flush records where `deleted_at` is older than X days.
- **Tag Orchestration:** Updating a note requires diffing the incoming tags array against current `note_tags`, executing inserts/deletes within a Postgres transaction.
- **Global Tag Deletion:** Cleanly cascades to `note_tags` without destroying the underlying `notes`.
- **Primary Key Trust:** Backend strictly trusts incoming Client UUIDv4s on POST routes, returning a 409 Conflict if a collision occurs.

## 5. Frontend State & Data Flow
- **Data Fetching:** React Query handles all asynchronous state, caching, and background refetching via `useQuery` and `useInfiniteQuery`.
- **Optimistic UI:** Client actions generate UUIDs locally, inject into the React Query cache via `onMutate`, and fire background network requests. On failure, `onError` rolls back the cache and displays a toast error; user input remains in the DOM form.
- **Offline Persistence:** TanStack Query Persister syncs the memory cache to IndexedDB.
- **Authentication Flow:** Frontend acquires JWT via Supabase Auth client, attaches it to the `Authorization` header in all Axios/Fetch requests to the Express backend.
- **Pagination:** Global client state must append new pages of data via infinite scroll instead of replacing the array.
- **Completed Sorting:** The client selector must automatically sort notes where `is_completed === true` to the end of the rendered list.
- **Markdown:** Markdown is strictly a UI presentation concern; raw markdown strings are sent to/from the API.

## 6. Security & Infrastructure
- **Authentication:** Supabase Auth (OAuth / Magic Link). Express middleware intercepts requests, extracts Bearer token, and validates via Supabase Admin / Auth client.
- **Authorization:** RLS enforces data isolation at the DB layer; service layer queries execute using the authenticated user's context.
