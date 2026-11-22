import { refresh, reportSyncError } from '@/lib/cloud'
import { supabase } from '@/lib/supabase'
import {
  useDataStore,
  type NewPlanInput,
  type NewTripInput,
  type StoryInput,
} from '@/store/data'

// Every UI write goes through here. The local store updates first so the
// screen reacts instantly; in cloud mode the same rows are then written to
// Supabase. If the server refuses, we report it and reload the server's truth.

const store = () => useDataStore.getState()

async function push(write: PromiseLike<{ error: unknown }>) {
  const { error } = await write
  if (error) {
    reportSyncError(error)
    await refresh().catch(reportSyncError)
  }
}

/** Resolves to the new trip id, or null if the server refused. */
export async function createTrip(input: NewTripInput): Promise<string | null> {
  if (!supabase) return store().addTrip(input)
  const { data, error } = await supabase.rpc('create_trip', {
    p_name: input.name.trim(),
    p_emoji: input.emoji,
    p_start_date: input.start_date,
    p_day_count: input.day_count,
  })
  if (error) {
    reportSyncError(error)
    return null
  }
  await refresh().catch(reportSyncError)
  return data as string
}

/** Resolves to the trip id, or null when the code is unknown. */
export async function joinTrip(code: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('join_trip', { p_code: code })
  if (error) {
    reportSyncError(error)
    return null
  }
  if (data) await refresh().catch(reportSyncError)
  return (data as string | null) ?? null
}

export function removeTrip(tripId: string) {
  store().deleteTrip(tripId)
  if (supabase) void push(supabase.from('trips').delete().eq('id', tripId))
}

export function addPlan(input: NewPlanInput) {
  const activity = store().addPlan(input)
  if (supabase) void push(supabase.from('activities').insert(activity))
}

export function addSurprise(
  input: Pick<NewPlanInput, 'trip_id' | 'day_index' | 'title'>,
  story: StoryInput,
) {
  const { activity, experience } = store().addSurprise(input, story)
  if (!supabase) return
  const client = supabase
  void (async () => {
    const first = await client.from('activities').insert(activity)
    if (first.error) return push(Promise.resolve(first))
    await push(client.from('experiences').insert(experience))
  })()
}

export function tellStory(activityId: string, story: StoryInput) {
  const experience = store().tellStory(activityId, story)
  if (supabase)
    void push(
      supabase.from('experiences').upsert(experience, { onConflict: 'activity_id,logged_by' }),
    )
}
