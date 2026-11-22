# TwoFold

A shared travel journal: what you planned next to how it actually went,
with every travel buddy keeping their own side of each moment.

React 19 + TypeScript + Vite + Tailwind 4 + Zustand. Design: cream `#F7F6F2`,
mint `#5BBFAD`, Nunito (same look as the original TwoFold prototype).

## Two modes

| | Demo mode | Cloud mode |
|---|---|---|
| When | no `.env` | `.env` with Supabase URL + anon key |
| Data | this browser only (localStorage) | Supabase, shared between devices |
| People | names typed when creating a trip | everyone signs in anonymously with a name, joins with an invite link |
| Network | none | Supabase only |

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Cloud setup (once)

Use a **new** Supabase project. Do not point this at the old prototype project.

1. supabase.com > New project (free tier is fine).
2. SQL Editor > New query > paste `supabase/schema.sql` > Run.
3. Authentication > Sign In / Providers > turn on **Allow anonymous sign-ins**.
4. Project Settings > API: copy the Project URL and the `anon` public key.
5. `cp .env.example .env` and fill in both values. Restart `npm run dev`.

`schema.sql` is safe to run again after changes.

### How access works

- Each device gets an anonymous Supabase user and a profile with a name.
- A trip is visible only to its members (row level security).
- `create_trip()` makes the creator the first member; `join_trip(code)` adds
  whoever has the 8-character invite code (`/join/<CODE>` link or the code box on Home).
- Each member writes only their own side (`experiences.logged_by = auth.uid()`),
  one per moment. Only the creator can delete a trip.
- Clearing the browser loses that anonymous identity (no account recovery yet).

## Code map

- `src/store/data.ts` – the store: whole database in demo mode, cache in cloud mode
- `src/lib/actions.ts` – every write: local first, then Supabase
- `src/lib/cloud.ts` – anonymous session, refresh, realtime
- `src/lib/demo.ts` – demo trip (dates relative to today, always live on day 2)
- `src/lib/summary.ts` – trip story numbers (no AI)
- `supabase/schema.sql` – tables, RLS, RPCs, realtime
