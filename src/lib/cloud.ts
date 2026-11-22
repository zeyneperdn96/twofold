import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useDataStore, type LocalActivity, type LocalTrip } from '@/store/data'
import type { Experience, User, Verdict } from '@/types'

// Session + sync for cloud mode. Every device signs in anonymously; the
// server (RLS) decides what it may see, so a refresh is simply "select *".

export type CloudStatus = 'off' | 'connecting' | 'needs-name' | 'ready' | 'error'

interface CloudState {
  status: CloudStatus
  error: string | null
  /** Last failed write, shown as a toast. */
  syncError: string | null
}

export const useCloudStore = create<CloudState>(() => ({
  status: supabase ? 'connecting' : 'off',
  error: null,
  syncError: null,
}))

let userId: string | null = null
let channel: RealtimeChannel | null = null
let refreshTimer: number | undefined
let booting: Promise<void> | null = null

const toNumber = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v)

export async function refresh(): Promise<void> {
  if (!supabase || !userId) return
  const [profiles, trips, members, activities, experiences] = await Promise.all([
    supabase.from('profiles').select('id, name, created_at'),
    supabase.from('trips').select('*'),
    supabase.from('trip_members').select('trip_id, user_id, joined_at'),
    supabase.from('activities').select('*'),
    supabase.from('experiences').select('*'),
  ])
  const failed = [profiles, trips, members, activities, experiences].find((r) => r.error)
  if (failed?.error) throw failed.error

  const memberRows = (members.data ?? []).slice().sort((a, b) =>
    String(a.joined_at).localeCompare(String(b.joined_at)),
  )

  useDataStore.getState().setSnapshot({
    currentUserId: userId,
    users: (profiles.data ?? []).map(
      (p): User => ({ id: p.id, name: p.name, email: '', avatar_url: null, created_at: p.created_at }),
    ),
    trips: (trips.data ?? []).map(
      (t): LocalTrip => ({
        id: t.id,
        name: t.name,
        emoji: t.emoji,
        start_date: t.start_date,
        day_count: t.day_count,
        join_code: t.join_code,
        created_by: t.created_by,
        created_at: t.created_at,
        member_ids: memberRows.filter((m) => m.trip_id === t.id).map((m) => m.user_id),
      }),
    ),
    activities: (activities.data ?? []).map(
      (a): LocalActivity => ({
        id: a.id,
        trip_id: a.trip_id,
        day_index: a.day_index,
        title: a.title,
        planned_time: a.planned_time,
        planned_cost: toNumber(a.planned_cost),
        planned_note: a.planned_note,
        unplanned: a.unplanned,
        created_by: a.created_by,
        created_at: a.created_at,
      }),
    ),
    experiences: (experiences.data ?? []).map(
      (e): Experience => ({
        id: e.id,
        activity_id: e.activity_id,
        note: e.note,
        actual_cost: toNumber(e.actual_cost),
        verdict: e.verdict as Verdict | null,
        logged_by: e.logged_by,
        logged_at: e.logged_at,
      }),
    ),
  })
}

/** Coalesces bursts of realtime events into one refresh. */
export function scheduleRefresh(delay = 250) {
  window.clearTimeout(refreshTimer)
  refreshTimer = window.setTimeout(() => {
    refresh().catch(reportSyncError)
  }, delay)
}

function subscribe() {
  if (!supabase || channel) return
  channel = supabase.channel('twofold-sync')
  for (const table of ['trips', 'trip_members', 'activities', 'experiences', 'profiles']) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => scheduleRefresh())
  }
  channel.subscribe()
  // realtime can miss events while a phone sleeps; catch up when we come back
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleRefresh(0)
  })
}

function describe(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String(err.message)
  return String(err)
}

export function reportSyncError(err: unknown) {
  console.error('[TwoFold sync]', err)
  useCloudStore.setState({ syncError: describe(err) })
}

export function clearSyncError() {
  useCloudStore.setState({ syncError: null })
}

async function start() {
  if (!supabase) return
  useCloudStore.setState({ status: 'connecting', error: null })
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    let session = sessionData.session
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      session = data.session
    }
    if (!session) throw new Error('No session')
    userId = session.user.id

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    if (!profile) {
      useCloudStore.setState({ status: 'needs-name' })
      return
    }
    await refresh()
    subscribe()
    useCloudStore.setState({ status: 'ready' })
  } catch (err) {
    console.error('[TwoFold boot]', err)
    useCloudStore.setState({ status: 'error', error: describe(err) })
  }
}

/** Safe to call more than once; StrictMode mounts effects twice. */
export function bootCloud(): Promise<void> {
  if (!supabase) return Promise.resolve()
  if (!booting) booting = start().finally(() => (booting = null))
  return booting
}

export async function saveName(name: string): Promise<boolean> {
  if (!supabase || !userId) return false
  const { error } = await supabase.from('profiles').upsert({ id: userId, name: name.trim() })
  if (error) {
    reportSyncError(error)
    return false
  }
  await refresh()
  subscribe()
  useCloudStore.setState({ status: 'ready' })
  return true
}
