# NOTOS

**Start Date:** 2026-06-23
**Current Status:** Active Development
**Tech Stack:** Next.js, Tailwind CSS, shadcn/ui, TypeScript, Supabase

## Description
NOTOS is a minimal note-taking app that allows you to create, read, update, and delete notes.

## Documentation Index
- Tech Stack: `docs/stack.md`
- Product Requirements: `docs/PRD.md`
- System Design: `docs/sdd.md`
- Active Tasks: `docs/tasks.md`

## Progress Logs
- 2026-06-23: Project initialized and core idea defined.
- 2026-06-23: PRD and wireframes generated.
- 2026-06-23: DB schema created for projects and notes with soft delete.
- 2026-06-23: RLS policies added so users only see their own data.
- 2026-06-23: pg_cron job set up to clean up old soft-deleted records.
- 2026-06-23: REST API v1 built for projects and notes.
- 2026-06-23: Supabase auth wired with magic link login.
- 2026-06-23: Offline-first sync added with IndexedDB and a background queue.
- 2026-06-23: Core app views built — dashboard, note list, and note detail.
- 2026-06-23: UI and UX design improved — sharp corners, subtle glow, pointer cursors.
- 2026-06-23: Navbar removed and logout moved to bottom center.
- 2026-06-23: Relative dates added with hover for full date.
- 2026-06-23: List views cleaned up — no edit/delete buttons on rows.
- 2026-06-23: Inline project create and rename added.
- 2026-06-23: Draft note flow added — new notes save only when you hit Save.
- 2026-06-23: Note detail uses Edit/Save/Cancel instead of autosave.
- 2026-06-23: Navigation skeletons show on click but stay silent during background sync.
- 2026-06-26: Tags, note completion, and note search/filtering added across DB, API, and UI.
- 2026-06-26: React Query replaced custom context, IndexedDB cache, and sync queue.
- 2026-06-26: Client-generated UUIDs required on project and note create; API returns 409 on duplicate IDs.
- 2026-06-26: Optimistic mutations added for projects, notes, and tags with rollback and toast on error.
- 2026-06-26: GET /api/v1/notes/:id added; note detail reads from its own query instead of the project notes list.
- 2026-06-26: Note URLs changed to /note/:id instead of nested /project/:id/note/:id paths.
- 2026-06-26: Dashboard navigation moved client-side with pushState so in-app route changes skip Next RSC fetches.
- 2026-06-26: React Query session cache staleTime set to 30 minutes; mutations invalidate and refetch related queries after success.
