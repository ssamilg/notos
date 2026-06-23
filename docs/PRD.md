# Product Requirements Document (v2.0)

## Overview

**Feature:** Notos (Noise to Signal) Core Application  
**Author:** PO Agent  
**Date:** 23-06-2026  

### Problem

Standard note-taking applications are cluttered with features and lack premium, ultra-modern aesthetics. Users seeking a distraction-free, visually striking tool for basic text capture are underserved by overly complex interfaces.

### Goal (In Scope)

To launch a minimalist, visually premium note-taking application that serves as a high-fidelity portfolio piece demonstrating product and engineering capability through a flawless, latency-free user experience, complete with simple project-based compartmentalization.

### Non-Goals (Strictly Out of Scope)

- Complex structural organization beyond one level of Projects (e.g., nested folders, multiple tags per note).
- Rich text formatting (e.g., image uploads, file attachments).
- Social, collaborative, or sharing features.
- Immediate permanent deletion (requires soft-delete strategy).

---

## User Stories

| As a… | I want to… | So that… |
|-------|------------|----------|
| User | securely log in to the application | my private notes are tied strictly to my identity. |
| User | view a list of my projects showing note counts and dates | I can easily navigate my top-level contexts. |
| User | create, read, update, and delete projects | I can manage the different areas of my life. |
| User | create a note and have it automatically assigned to a default project if none is selected | I never lose a quick thought to navigational friction. |
| User | "delete" a project or note and have it held in a recovery state for a few days | I can recover from accidental deletions before the system permanently flushes them. |
| User | access and modify my data without an active internet connection | my workflow is uninterrupted regardless of my network environment. |

---

## Requirements

### Functional

- [ ] **Auth:** The system must require user authentication prior to accessing or creating data.
- [ ] **Hierarchy:** The system must enforce a two-tier hierarchy: Projects -> Notes.
- [ ] **Project CRUD:** Projects require a `name`, `created_at`, `updated_at`, and `deleted_at` field.
- [ ] **Note CRUD:** Notes require a `title`, `text`, `tag`, `project_id`, `created_at`, `updated_at`, and `deleted_at` field.
- [ ] **Default State:** The system must provision a "Default" project for new users.
- [ ] **Soft Delete & Cron:** Deleting an item populates the `deleted_at` timestamp. A scheduled background job (cron) will permanently flush records where `deleted_at` is older than X days.
- [ ] **Sync:** The system must synchronize data across multiple devices based on the authenticated user's identity.

### Non-Functional

- [ ] **Performance:** The application must utilize an offline-first data approach paired with optimistic UI rendering to guarantee zero perceived latency.
- [ ] **Aesthetic/Design:** The interface must strictly adhere to a high-contrast, minimalist theme featuring pure dark black backgrounds and glowing light white text/accents.
- [ ] **Security:** All data must be strictly isolated via Supabase Row Level Security (RLS).

---

## UX Flow & Design Reference

**Design Artifact:** Custom "Ultra-Modern" Minimalist UI (Pure Dark Black / Glowing Light White)

**Step-by-Step Flow:**
1. **App Launch:** User lands on the **Project List** view. Displays vertical list: `Project Name | Note Count | Dates`.
2. **Context Switch:** User taps a Project. UI seamlessly transitions to the **Notes List** view for that specific project.
3. **Creation:** User creates a note. UI instantly renders the new note optimistically. Background sync pushes the record to Supabase.
4. **Deletion:** User deletes a note/project. It immediately vanishes from the UI but is marked `deleted_at` in the database, awaiting the cleanup job.
