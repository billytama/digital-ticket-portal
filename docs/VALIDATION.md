# Validation — 29 October 2026

## Public workspace update

- Removed admin login UI, sessions, auth handlers and synthetic-demo substitution. Requests now use the shared D1 database directly without cookies.
- Legacy `/auth/*` routes return HTTP 410. Applied database migrations are unchanged, preserving existing tickets and history.
- Increased typography throughout desktop/mobile layouts: root 16px, mobile inputs 16px, field labels 14px, larger buttons and readable table/card text.
- Ten unit tests passed for SLA and migration, including CANCEL/reopen, accumulation and preserved IDs/history/attachments.
- TypeScript and frontend production build passed.
- Local API integration passed: anonymous read/create/update, retired login, same-origin enforcement, persisted shared state, concurrent version conflict, CANCEL/reopen, and disabled R2 uploads.
- Browser local form submission without login succeeded.
- Desktop layout checked at 1440px; mobile at 390px had no document horizontal overflow. Computed mobile input font 16px, label 14px, root 16px.

## Hosting

Public source: https://github.com/billytama/digital-ticket-portal

Live app: https://digital-ticket-portal.billytamaputra.workers.dev

Cloudflare account remains on Workers Free + D1 Free. R2 remains disabled. No source migration or database reset is required for this update. The previous admin credentials are not used by the new Worker. The original Sites deployment is separate and unchanged.

Production verification passed: `/api/config` reports public access, ticket reads work without cookies, legacy login returns 410, a status update for a nonexistent ticket reaches the handler and returns 404 without a session, cross-origin writes return 403, and R2 remains disabled. Existing production tickets were not modified. GitHub Actions passed for the implementation commit. Production browser verification found zero login buttons; mobile inputs are 16px and the 390px viewport has no page overflow. Screenshots have been refreshed from the live public workspace. No load/capacity testing or old Sites data/file import has been performed.
