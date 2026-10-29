# Hosting Cloudflare — public workspace

Target: **Workers Free + D1 Free**, with a `workers.dev` URL. No admin login, password, session secret, custom domain or R2 subscription is needed for the basic app. Every visitor can read, create and change tickets in the same shared database.

## Local development

Node.js 24 LTS:

```sh
npm ci
cp wrangler.example.jsonc wrangler.local.jsonc
npm run build
npm run db:local
npm run dev
```

The database is simulated locally in `.wrangler/standalone`. No `.dev.vars` file is required. Schema migrations are append-only; the historical login-attempts migration remains for compatibility but is unused.

## First deployment

Create your own Cloudflare account and authenticate through Wrangler:

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create ticket-portal-db
```

Set the returned database UUID in `wrangler.local.jsonc`, preserving binding `DB`. The example UUID is for local development only. Choose Workers Free; do not upgrade to Paid if you want to stay on the free plan.

```sh
npm run db:remote
npm test
npm run typecheck
npm run deploy
```

Use the URL printed by Wrangler. Config containing account/database identifiers stays local and is ignored by Git. Future deployments need only `npm run deploy`; run remote migrations only when new migrations are added. Existing tickets and SLA history remain in D1 across deployments.

## Upgrade from the former admin version

Deploy the new source against the same D1 binding. No data migration, reset or authentication is required for the app. Old `/auth/*` endpoints return HTTP 410. Legacy admin secrets are not read by the app and can be removed from Worker settings separately. Historical migration files must not be edited or replayed manually.

## Optional R2

File upload is disabled without `BUCKET`. To enable it, review and activate the R2 subscription in the dashboard, create a bucket, add the binding and redeploy:

```sh
npx wrangler r2 bucket create ticket-portal-files
```

```json
"r2_buckets": [{"binding":"BUCKET","bucket_name":"ticket-portal-files"}]
```

The bucket itself need not have a public bucket URL, but uploaded files are downloadable by all portal visitors through the public file API. R2 usage above its free quota can incur charges. The current deployment leaves R2 disabled.

## Quotas

Checked 29 October 2026. Workers Free: 100,000 Worker requests/day and 10ms CPU/request. D1 Free: 5 GB total account storage, 5 million rows read/day and 100,000 rows written/day. R2 Standard optional: 10 GB-month storage, 1 million class A and 10 million class B operations/month included. Rp0 depends on staying within free quotas and keeping optional paid services disabled.

The app polls every 15s per active browser. Full dataset reads are suitable for a small project; add server pagination for larger usage. No uptime guarantee or production capacity claim is made for the free plan.

## Verify

Open in a new/incognito browser without cookies. Create a ticket, update it from another browser, confirm shared state after refresh, test CANCEL/reopen and preserved SLA history. Cross-origin writes should return 403 and stale-version writes 409. No login UI or demo substitution should appear.

## Official references

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/r2/pricing/
