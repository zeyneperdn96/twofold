import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createDemoData, DEMO_CURRENT_USER_ID, DEMO_USERS } from '@/lib/demo'
import { isDayOver, startOfToday } from '@/lib/dates'
import { isCloud } from '@/lib/supabase'
import type {
  Activity,
  ActivityState,
  ActivityWithExperiences,
  Experience,
  User,
  Verdict,
} from '@/types'

// Local-first data layer and UI cache. In demo mode this is the whole
// database (localStorage). In cloud mode it caches what Supabase returned;
// src/lib/actions.ts mirrors every change to the server. Nothing in this
// file talks to the network.

export interface LocalTrip {
  id: string
  name: string
  emoji: string
  start_date: string // YYYY-MM-DD, local
  day_count: number
  member_ids: string[]
  /** Cloud mode only: invite code. */
  join_code?: string
  created_by: string
  created_at: string
}

export interface LocalActivity extends Activity {
  /** Logged on the spot, never planned. */
  unplanned: boolean
}

export interface NewTripInput {
  name: string
  emoji: string
  start_date: string
  day_count: number
  companions: string[]
}

export interface NewPlanInput {
  trip_id: string
  day_index: number
  title: string
  planned_time: string | null
  planned_cost: number | null
  planned_note: string | null
}

export interface StoryInput {
  note: string
  actual_cost: number | null
  verdict: Verdict | null
}

interface DataState {
  users: User[]
  currentUserId: string
  trips: LocalTrip[]
  activities: LocalActivity[]
  experiences: Experience[]

  addTrip: (input: NewTripInput) => string
  deleteTrip: (tripId: string) => void
  addPlan: (input: NewPlanInput) => LocalActivity
  addSurprise: (
    input: Pick<NewPlanInput, 'trip_id' | 'day_index' | 'title'>,
    story: StoryInput,
  ) => { activity: LocalActivity; experience: Experience }
  /** Adds or replaces the current user's side of a moment. */
  tellStory: (activityId: string, story: StoryInput) => Experience
  deleteActivity: (activityId: string) => void
  resetDemo: () => void
  /** Cloud mode: replace the cache with what the server returned. */
  setSnapshot: (snapshot: Snapshot) => void
}

export interface Snapshot {
  users: User[]
  currentUserId: string
  trips: LocalTrip[]
  activities: LocalActivity[]
  experiences: Experience[]
}

const uid = () => crypto.randomUUID()

function seed() {
  if (isCloud) {
    return { users: [], currentUserId: '', trips: [], activities: [], experiences: [] }
  }
  return {
    users: DEMO_USERS,
    currentUserId: DEMO_CURRENT_USER_ID,
    ...createDemoData(startOfToday()),
  }
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...seed(),

      addTrip: (input) => {
        const { users, currentUserId } = get()
        const companions: User[] = []
        for (const raw of input.companions) {
          const name = raw.trim()
          if (!name) continue
          // reuse a known person with the same name so their colour stays stable
          const known =
            users.find((u) => u.name.toLowerCase() === name.toLowerCase()) ??
            companions.find((u) => u.name.toLowerCase() === name.toLowerCase())
          if (known) {
            if (!companions.includes(known)) companions.push(known)
            continue
          }
          companions.push({ id: uid(), email: '', name, avatar_url: null, created_at: '' })
        }
        const newUsers = companions.filter((c) => !users.some((u) => u.id === c.id))
        const memberIds = [
          currentUserId,
          ...companions.map((c) => c.id).filter((id) => id !== currentUserId),
        ]
        const trip: LocalTrip = {
          id: uid(),
          name: input.name.trim(),
          emoji: input.emoji,
          start_date: input.start_date,
          day_count: input.day_count,
          member_ids: memberIds,
          created_by: currentUserId,
          created_at: new Date().toISOString(),
        }
        set((s) => ({ users: [...s.users, ...newUsers], trips: [trip, ...s.trips] }))
        return trip.id
      },

      deleteTrip: (tripId) =>
        set((s) => {
          const activityIds = new Set(
            s.activities.filter((a) => a.trip_id === tripId).map((a) => a.id),
          )
          return {
            trips: s.trips.filter((t) => t.id !== tripId),
            activities: s.activities.filter((a) => !activityIds.has(a.id)),
            experiences: s.experiences.filter((e) => !activityIds.has(e.activity_id)),
          }
        }),

      addPlan: (input) => {
        const activity: LocalActivity = {
          id: uid(),
          ...input,
          title: input.title.trim(),
          unplanned: false,
          created_by: get().currentUserId,
          created_at: new Date().toISOString(),
        }
        set((s) => ({ activities: [...s.activities, activity] }))
        return activity
      },

      addSurprise: (input, story) => {
        const me = get().currentUserId
        const now = new Date().toISOString()
        const activity: LocalActivity = {
          id: uid(),
          ...input,
          title: input.title.trim(),
          planned_time: null,
          planned_cost: null,
          planned_note: null,
          unplanned: true,
          created_by: me,
          created_at: now,
        }
        const experience: Experience = {
          id: uid(),
          activity_id: activity.id,
          note: story.note.trim(),
          actual_cost: story.actual_cost,
          verdict: story.verdict,
          logged_by: me,
          logged_at: now,
        }
        set((s) => ({
          activities: [...s.activities, activity],
          experiences: [...s.experiences, experience],
        }))
        return { activity, experience }
      },

      tellStory: (activityId, story) => {
        const { experiences, currentUserId } = get()
        const mine = experiences.find(
          (e) => e.activity_id === activityId && e.logged_by === currentUserId,
        )
        const experience: Experience = {
          // editing keeps the same row, so the server can upsert it
          id: mine?.id ?? uid(),
          activity_id: activityId,
          note: story.note.trim(),
          actual_cost: story.actual_cost,
          verdict: story.verdict,
          logged_by: currentUserId,
          logged_at: new Date().toISOString(),
        }
        set((s) => ({
          experiences: [...s.experiences.filter((e) => e !== mine), experience],
        }))
        return experience
      },

      deleteActivity: (activityId) =>
        set((s) => ({
          activities: s.activities.filter((a) => a.id !== activityId),
          experiences: s.experiences.filter((e) => e.activity_id !== activityId),
        })),

      resetDemo: () => set(seed()),

      setSnapshot: (snapshot) => set(snapshot),
    }),
    // separate caches so demo data never mixes with cloud data
    { name: isCloud ? 'twofold-cloud-cache' : 'twofold-data', version: 1 },
  ),
)

// === Derived views (pure, use inside useMemo) ===

export function activityState(
  activity: LocalActivity,
  experienceCount: number,
  trip: LocalTrip,
  today: Date,
): ActivityState {
  if (activity.unplanned) return 'unplanned'
  if (experienceCount > 0) return 'experienced'
  return isDayOver(trip.start_date, activity.day_index, today) ? 'ghost' : 'plan-only'
}

export function buildTripActivities(
  trip: LocalTrip,
  activities: LocalActivity[],
  experiences: Experience[],
  users: User[],
  today: Date,
): ActivityWithExperiences[] {
  const userById = new Map(users.map((u) => [u.id, u]))
  return activities
    .filter((a) => a.trip_id === trip.id)
    .map((a) => {
      const exps = experiences
        .filter((e) => e.activity_id === a.id)
        .sort((x, y) => x.logged_at.localeCompare(y.logged_at))
        .map((e) => ({ ...e, user: userById.get(e.logged_by) }))
      return {
        ...a,
        experiences: exps,
        state: activityState(a, exps.length, trip, today),
        created_by_user: userById.get(a.created_by),
      }
    })
}
