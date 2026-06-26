# System Design Document (SDD)
**Feature / Project:** NOTOS Core Application
**Author:** PM Agent
**Created:** 23-06-2026
**Last Updated:** 26-06-2026

## 1. System Architecture
- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui, React Query (TanStack)
- **Backend:** Next.js Route Handlers (`app/api`)
- **Database:** Supabase (PostgreSQL)
- **Core Pattern:** Optimistic UI with React Query memory caching (transient local state synced to DB).

## 2. Database Schema (Data Access Layer)

*Note: Schema remains unchanged from Iteration 3, but primary key insertion logic shifts — `projects.id` and `notes.id` are client-generated UUIDs.*

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
*Standard Envelope:* `{ "data": any, "error": string | null }`

### GET /api/v1/projects
- **Purpose:** Fetches all active projects for authenticated user.
- **Auth Required:** Yes

### POST /api/v1/projects
- **Purpose:** Creates a new project.
- **Auth Required:** Yes
- **Payload:** Expects a client-generated UUIDv4 in the payload. Inserts directly into Supabase.

### PUT /api/v1/projects/:id
- **Purpose:** Updates project (or applies soft delete).
- **Auth Required:** Yes

### GET /api/v1/notes
- **Purpose:** Fetches notes with filtering and pagination.
- **Request Parameters:** `projectId` (UUID), `cursor` (Timestampz, optional), `search` (Text, optional), `tag_id` (UUID, optional)
- **Auth Required:** Yes

### POST /api/v1/notes
- **Purpose:** Creates a new note.
- **Auth Required:** Yes
- **Payload:** Expects a client-generated UUIDv4 in the payload. Inserts directly into Supabase.

### PUT /api/v1/notes/:id
- **Purpose:** Updates note (or applies soft delete).
- **Auth Required:** Yes

### GET /api/v1/tags
- **Purpose:** Fetches all tags and their associated active note counts for the user.
- **Auth Required:** Yes

### DELETE /api/v1/tags/:id
- **Purpose:** Globally deletes a tag (cascades to `note_tags` but does not delete `notes`).
- **Auth Required:** Yes

## 4. Business Logic (Service Layer)
- **Default Provisioning:** On a new user's first login, the system must automatically provision a "Default" project.
- **Soft Deletion:** DELETE HTTP requests are mapped to PUT requests updating the `deleted_at` column.
- **Cron Cleanup:** `pg_cron` script runs to permanently flush records where `deleted_at` is older than X days.
- **Global Tag Deletion:** Deleting a tag must cleanly remove associations in `note_tags` without altering the `notes` themselves.
- **Note Updates (Tags):** When a note is updated, the service layer must diff the provided tags array against existing `note_tags`, inserting new relationships and deleting removed ones within a transaction.
- **ID Trust:** The API validation layer (e.g., Zod) must strictly validate that incoming IDs are valid UUIDv4 strings to prevent database injection errors.
- **Conflict Resolution:** If a client submits a POST with a UUID that already exists in the database, the backend must return a 409 Conflict error, which React Query will catch to trigger a UI rollback.

## 5. Frontend State & Data Flow
- **Data Fetching:** React Query `useQuery` and `useInfiniteQuery` replace all `useEffect` fetches.
- **Optimistic Mutations:**
  1. User triggers action (e.g., creates Note).
  2. Frontend generates UUIDv4.
  3. `useMutation`'s `onMutate` callback intercepts the request and instantly injects the new Note into the local React Query cache. UI updates instantly.
  4. Network request executes in the background.
  5. If network/database fails, `onError` catches the exception, silently rolls back the cache to the previous state, and displays a toast error message. User input remains in the DOM form.
- **Cache Lifecycle:** A hard browser refresh wipes the React Query memory cache, triggering a fresh `GET` request to the Next.js API to ensure absolute synchronization with Supabase.
- **Pagination:** Global client state must append new pages of data via infinite scroll instead of replacing the array.
- **Completed Sorting:** The client selector must automatically sort notes where `is_completed === true` to the end of the rendered list.
- **Markdown:** Markdown is strictly a UI presentation concern; raw markdown strings are sent to/from the API.

## 6. Security & Infrastructure
- **Authentication:** Supabase Auth (OAuth / Magic Link).
- **Authorization:** Supabase Row Level Security (RLS) policies enforcing data isolation. Edge middleware protects `/api` routes.
