# Task 6 — Client Portal Builder (full-stack-developer)

## Summary
Built the complete **Client Portal** for Shaheen Law Associates. The portal is rendered when a logged-in client navigates to `view: 'client-portal'` (guarded by `page.tsx`).

## Files Created / Modified
- `src/components/portal/client-portal.tsx` — **main shell** (rewrote stub): desktop sidebar + mobile Sheet drawer, sticky top bar with section title + "Book Consultation" button, routes between 7 sections via local `useState`
- `src/components/portal/client/labels.ts` — display label maps (case/appointment/document/invoice/update types) + `labelOf()` helper
- `src/components/portal/client/portal-sidebar.tsx` — logo, 7 nav items, user card, logout, "Back to Website"
- `src/components/portal/client/overview-section.tsx` — welcome banner, 4 stat cards, recent-updates timeline, upcoming-appts list, cases-at-a-glance
- `src/components/portal/client/cases-section.tsx` — searchable/filterable case grid → opens detail dialog
- `src/components/portal/client/case-detail-dialog.tsx` — large dialog: header, description, lawyer card, vertical timeline, documents, invoices
- `src/components/portal/client/appointments-section.tsx` — Upcoming/Past tabs with date-block cards
- `src/components/portal/client/documents-section.tsx` — desktop table + mobile cards, search + type filter
- `src/components/portal/client/invoices-section.tsx` — 3 summary cards + progress bar + All/Overdue/Pending/Paid tabs
- `src/components/portal/client/messages-section.tsx` — two-pane chat with lawyer list + conversation bubbles + composer
- `src/components/portal/client/profile-section.tsx` — profile header + personal-info grid + account-status cards

## Key Implementation Decisions
1. **Lint-rule compliance** (`react-hooks/set-state-in-effect`): Every section fetches data in `useEffect` and only calls `setState` inside `.then()`/`.finally()` callbacks — never synchronously in the effect body. The `CaseDetailDialog` uses a **keyed inner `CaseDetailBody` component** (keyed on `caseId`) so loading state resets via the `useState` initializer on each open, avoiding the forbidden synchronous `setLoading(true)` in the effect.
2. **Recent-updates feed** in Overview: fetches `/api/cases` then fetches details for the 3 most-recently-updated cases in parallel and merges their updates into a single sorted timeline.
3. **Messages**: auto-selects first lawyer, fetches `/api/messages?partnerId=X` (which server-side marks received messages as read), sends via POST, appends optimistically, auto-scrolls to bottom.
4. **Responsive**: 1-col mobile → 2-col+ desktop; sidebar collapses to a Sheet drawer; messages pane toggles between list/conversation on mobile.
5. **Theme**: emerald `bg-primary`/`text-primary`, gold `text-accent`, cream `bg-background`; `font-serif` (Playfair) for all headings/titles. No blue/indigo.

## Data Sources (all existing APIs)
- `GET /api/cases`, `GET /api/cases/[id]` (cases + detail)
- `GET /api/appointments` (appointments)
- `GET /api/documents` (documents)
- `GET /api/invoices` (invoices)
- `GET /api/team` (lawyers for messages)
- `GET /api/messages?partnerId=X`, `POST /api/messages` (chat)

## Lint Status
All client-portal files pass `bun run lint` with **zero errors**. (3 errors remained in the parallel admin-portal task's files — `admin/messages-section.tsx`, `admin/new-appointment-dialog.tsx`, `admin/new-case-dialog.tsx` — which belong to Task 5 and were being actively fixed by that agent in parallel.)
