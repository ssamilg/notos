# ADR-002: UX/UI Refinements & Inline Editing

**Date:** 2026-06-23
**Status:** Accepted

## Context
The initial wireframes and SDD assumed standard CRUD navigation (e.g., navigating to a separate "Edit" screen or using action buttons). UX review highlighted that this introduces unnecessary friction. Furthermore, the default styling (rounded corners, heavy glows, top navbars) conflicted with the desired ultra-modern, pure-signal aesthetic. We need to refine the global UI constraints and interaction models.

## Decision
1. **Interaction Model:** Deprecate dedicated Edit screens. All mutations will happen via "in-place editing" (clicking a text element transforms it into an input field).
2. **Visual Language:** Enforce absolute sharp corners (`border-radius: 0`) and reduce hover glow intensity globally.
3. **Navigation:** Remove traditional top navbars. Global actions (Logout) will be anchored minimally to the bottom center.
4. **Metadata:** Switch to relative date formatting by default, hiding absolute dates behind hover states.

## Consequences

### Positive
- Drastically reduces navigational clicks, keeping the user in the "flow."
- The UI becomes significantly cleaner by removing redundant action buttons and navbars.
- Sharp corners and subtle glows elevate the "premium" dark aesthetic.

### Negative
- In-place editing increases frontend component complexity (handling `isEditing` state, focus management, and `onBlur` saves).
