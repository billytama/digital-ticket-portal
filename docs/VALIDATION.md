# Validation — 29 October 2026

Verified locally on Node.js 24:

- 13 tests: status SLA accumulation, completion/cancellation freeze, reopen, breach retention, signed session expiry/tampering, password verification, secure cookie flags, and migration round-trip with IDs/history/attachments/SQL quoting.
- TypeScript `tsc --noEmit` passed for exported standalone repository.
- Static frontend production build passed.
- Wrangler deploy dry-run passed; Worker bundle approximately 12.5 KiB before gzip (assets separate).
- Fresh standalone local D1 migrations passed.
- Integration API passed in exported repository: synthetic demo isolation, anonymous write denial, origin/CSRF denial, admin login, ticket creation, concurrent version conflict, CANCEL, disabled-R2 rejection, logout cookie.
- Browser preview: demo, dashboard, four workboard columns, read-only status controls. Desktop 1440px and mobile 390px checked; mobile document scroll width equals viewport width.

## Production deployment verified

- Public source: https://github.com/billytama/digital-ticket-portal
- Live app: https://digital-ticket-portal.billytamaputra.workers.dev
- Cloudflare Dashboard confirmed **Workers Free ($0), Current plan**.
- Remote D1 created and both schema migrations applied successfully.
- Worker deployed successfully; recorded startup time 1 ms.
- Admin password and session-signing secret stored in Cloudflare Worker Secrets, not source.
- HTTPS smoke test passed: synthetic demo returns four tickets; anonymous writes denied; signed secure admin login/logout works; authenticated D1 database is reachable and initially empty; missing-ticket update returns 404; R2 disabled. No test tickets were created in production.
- GitHub Actions completed successfully after first push.
- Browser verified production four-column workboard with synthetic data.

Not performed: import of old Sites data/files, R2 activation, load testing or multiuser authentication. The owner receives the admin password through an ignored local file, never through the public repository.

Screenshots in docs/images contain synthetic portfolio data only. This file describes checks performed on the prepared source; later changes require revalidation.
