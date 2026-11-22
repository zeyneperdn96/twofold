# Tests

Browser tests drive a built app with system Chrome via `playwright-core`
(not a project dependency; point `PLAYWRIGHT_CORE` at any install).

| File | Needs | Run |
|---|---|---|
| `e2e.cjs` | demo build on :4399 | `node tests/e2e.cjs <screenshot-dir>` |
| `e2e-story.cjs` | demo build on :4399 | `node tests/e2e-story.cjs <screenshot-dir>` |
| `e2e-cloud.cjs` | cloud build (real `.env`) on :4400 | `node tests/e2e-cloud.cjs <screenshot-dir> [url]` |
| `rls.mjs` | `@electric-sql/pglite` | `node tests/rls.mjs supabase/schema.sql` |

Serve a build: `npm run build && npx vite preview --port 4399`.
`rls.mjs` runs `supabase/schema.sql` on real Postgres (PGlite) with a stubbed
`auth` schema and checks every row level security rule as three users.
