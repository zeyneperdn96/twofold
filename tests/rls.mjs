// Runs supabase/schema.sql on real Postgres (PGlite) with a stubbed auth schema
// and checks the row level security rules as three different users.
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'

const schema = readFileSync(process.argv[2], 'utf8')
const db = new PGlite()
const results = []
const check = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`)

// --- Supabase-like environment ---
await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`)
await db.exec(schema)
check('schema applies cleanly', true)
await db.exec(schema)
check('schema is re-runnable', true)

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'
const C = '00000000-0000-0000-0000-00000000000c'
await db.exec(`insert into auth.users values ('${A}'),('${B}'),('${C}')`)

async function as(user, sql, params = []) {
  await db.exec(`reset role; set request.jwt.claim.sub = '${user ?? ''}'; set role ${user ? 'authenticated' : 'anon'};`)
  try {
    return await db.query(sql, params)
  } finally {
    await db.exec('reset role')
  }
}
async function fails(user, sql, params = []) {
  try {
    await as(user, sql, params)
    return false
  } catch {
    return true
  }
}

// profiles
await as(A, `insert into profiles (id, name) values ($1, 'Zeynep')`, [A])
await as(B, `insert into profiles (id, name) values ($1, 'Alex')`, [B])
await as(C, `insert into profiles (id, name) values ($1, 'Stranger')`, [C])
check('cannot create profile for someone else', await fails(A, `insert into profiles (id, name) values ($1, 'x')`, [C]))
check('cannot write to trips directly', await fails(A, `insert into trips (name, start_date, day_count, created_by) values ('x', '2026-12-01', 3, $1)`, [A]))
check('anon cannot create_trip', await fails(null, `select create_trip('x', '✈️', '2026-12-01', 3)`))

// A creates a trip
const tripId = (await as(A, `select create_trip('Lisbon', '🌸', '2026-12-01', 3) as id`)).rows[0].id
check('create_trip returns id', !!tripId)
const code = (await as(A, `select join_code from trips where id = $1`, [tripId])).rows[0]?.join_code
check('creator sees trip + code', /^[0-9A-F]{8}$/.test(code ?? ''), code)

// B is not a member yet
check('outsider cannot see trip', (await as(B, `select * from trips`)).rows.length === 0)
check('outsider cannot add activity',
  await fails(B, `insert into activities (trip_id, day_index, title, created_by) values ($1, 0, 'x', $2)`, [tripId, B]))
check('wrong code returns null', (await as(B, `select join_trip('NOPE1234') as t`)).rows[0].t === null)
check('join_trip with code (lowercase, spaces)', (await as(B, `select join_trip($1) as t`, [` ${code.toLowerCase()} `])).rows[0].t === tripId)
check('joining twice is harmless', (await as(B, `select join_trip($1) as t`, [code])).rows[0].t === tripId)
check('member sees trip', (await as(B, `select * from trips`)).rows.length === 1)
check('member sees 2 members', (await as(B, `select * from trip_members`)).rows.length === 2)

// profiles visibility
check('A sees B profile', (await as(A, `select name from profiles where id = $1`, [B])).rows.length === 1)
check('C cannot see A profile', (await as(C, `select name from profiles where id = $1`, [A])).rows.length === 0)
check('C sees own profile', (await as(C, `select name from profiles where id = $1`, [C])).rows.length === 1)

// activities
const act = (await as(A,
  `insert into activities (trip_id, day_index, title, planned_time, planned_cost, created_by)
   values ($1, 0, 'Tram 28', '09:30', 3, $2) returning id`, [tripId, A])).rows[0].id
check('member adds activity', !!act)
check('cannot add activity as someone else',
  await fails(B, `insert into activities (trip_id, day_index, title, created_by) values ($1, 0, 'x', $2)`, [tripId, A]))
check('bad time format rejected',
  await fails(A, `insert into activities (trip_id, day_index, title, planned_time, created_by) values ($1, 0, 'x', '9am', $2)`, [tripId, A]))
check('outsider sees no activities', (await as(C, `select * from activities`)).rows.length === 0)

// experiences
await as(B, `insert into experiences (activity_id, note, actual_cost, verdict, logged_by) values ($1, 'Packed but fun.', 3, 'same', $2)`, [act, B])
check('member logs own side', (await as(A, `select * from experiences`)).rows.length === 1)
check('cannot log for someone else',
  await fails(B, `insert into experiences (activity_id, note, logged_by) values ($1, 'x', $2)`, [act, A]))
check('one side per person (unique)',
  await fails(B, `insert into experiences (activity_id, note, logged_by) values ($1, 'again', $2)`, [act, B]))
await as(B, `insert into experiences (activity_id, note, verdict, logged_by) values ($1, 'Edited.', 'more', $2)
             on conflict (activity_id, logged_by) do update set note = excluded.note, verdict = excluded.verdict`, [act, B])
check('upsert edits own side', (await as(A, `select note from experiences`)).rows[0].note === 'Edited.')
const upd = await as(A, `update experiences set note = 'hacked' where logged_by = $1`, [B])
check("cannot edit someone else's side", upd.affectedRows === 0)
check('empty note rejected',
  await fails(A, `insert into experiences (activity_id, note, logged_by) values ($1, '   ', $2)`, [act, A]))
check('bad verdict rejected',
  await fails(A, `insert into experiences (activity_id, note, verdict, logged_by) values ($1, 'x', 'meh', $2)`, [act, A]))
check('outsider sees no experiences', (await as(C, `select * from experiences`)).rows.length === 0)
check('outsider cannot log on trip',
  await fails(C, `insert into experiences (activity_id, note, logged_by) values ($1, 'x', $2)`, [act, C]))

// deletion
const delB = await as(B, `delete from trips where id = $1`, [tripId])
check('non-creator cannot delete trip', delB.affectedRows === 0)
const delAct = await as(B, `delete from activities where id = $1`, [act])
check("cannot delete someone else's activity", delAct.affectedRows === 0)
const delA = await as(A, `delete from trips where id = $1`, [tripId])
check('creator deletes trip', delA.affectedRows === 1)
const left = await db.query(`select (select count(*) from activities) a, (select count(*) from experiences) e, (select count(*) from trip_members) m`)
check('cascade removes everything', left.rows[0].a == 0 && left.rows[0].e == 0 && left.rows[0].m == 0, JSON.stringify(left.rows[0]))

console.log(results.join('\n'))
