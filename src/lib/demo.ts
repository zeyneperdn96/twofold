import { addDays, toISODate } from '@/lib/dates'
import type { Experience, User, Verdict } from '@/types'
import type { LocalActivity, LocalTrip } from '@/store/data'

// Demo trip, seeded on first launch. Dates are relative to "today" so the
// trip is always live on its second day: Day 1 is lived, Day 2 is happening,
// Day 3 is still ahead.

export const DEMO_USERS: User[] = [
  { id: 'u1', email: '', name: 'Alex', avatar_url: null, created_at: '' },
  { id: 'u2', email: '', name: 'Zeynep', avatar_url: null, created_at: '' },
  { id: 'u3', email: '', name: 'Mike', avatar_url: null, created_at: '' },
]

/** The demo is seen through Zeynep's eyes. */
export const DEMO_CURRENT_USER_ID = 'u2'

export interface DemoData {
  trips: LocalTrip[]
  activities: LocalActivity[]
  experiences: Experience[]
}

export function createDemoData(today: Date): DemoData {
  const start = addDays(today, -1)
  const tripId = 't-demo'

  const at = (dayIndex: number, time: string) => {
    const [h, m] = time.split(':').map(Number)
    const d = addDays(start, dayIndex)
    d.setHours(h, m)
    return d.toISOString()
  }

  const activities: LocalActivity[] = []
  const experiences: Experience[] = []

  const plan = (
    id: string,
    day: number,
    title: string,
    by: string,
    time: string | null,
    cost: number | null,
    note: string | null,
  ) => {
    activities.push({
      id,
      trip_id: tripId,
      day_index: day,
      title,
      planned_time: time,
      planned_cost: cost,
      planned_note: note,
      unplanned: false,
      created_by: by,
      created_at: '',
    })
  }

  const surprise = (id: string, day: number, title: string, by: string) => {
    activities.push({
      id,
      trip_id: tripId,
      day_index: day,
      title,
      planned_time: null,
      planned_cost: null,
      planned_note: null,
      unplanned: true,
      created_by: by,
      created_at: '',
    })
  }

  const log = (
    activityId: string,
    by: string,
    note: string,
    cost: number | null,
    verdict: Verdict | null,
    loggedAt: string,
  ) => {
    experiences.push({
      id: `${activityId}-${by}`,
      activity_id: activityId,
      note,
      actual_cost: cost,
      verdict,
      logged_by: by,
      logged_at: loggedAt,
    })
  }

  // === Day 1: lived, multi-voice ===
  plan('a1', 0, 'Café de Flore breakfast', 'u2', '09:00', 25, 'Famous for the croissants.')
  log('a1', 'u2', 'The croissants were unbelievable. Worth every euro.', 32, 'more', at(0, '10:05'))
  log('a1', 'u1', 'Croissants good, coffee average. Service was slow.', 30, 'same', at(0, '10:12'))

  plan('a2', 0, 'Louvre Museum', 'u2', '11:30', 22, 'Mona Lisa, obviously.')
  log('a2', 'u1', 'Three hours in and we had seen maybe 10%. The crowd around Mona Lisa was its own art piece.', 22, 'same', at(0, '14:40'))
  log('a2', 'u2', 'Beautiful pieces but exhausting. I gave up by the Egyptian wing.', 22, 'less', at(0, '14:45'))
  log('a2', 'u3', 'Could have spent a whole day here. The Italian rooms are stunning.', 22, 'more', at(0, '14:50'))

  surprise('a3', 0, 'Crepe stand near the river', 'u1')
  log('a3', 'u1', 'Stumbled on this on the way back. Best crepe of the trip.', 8, 'more', at(0, '16:20'))
  log('a3', 'u3', 'Followed Alex. Worth the detour.', 7, 'more', at(0, '16:24'))

  plan('a4', 0, 'Eiffel Tower at sunset', 'u1', '18:00', 30, 'Hopefully not too crowded.')
  log('a4', 'u2', 'The line took an hour but the city at dusk was worth it. Colder up there than we expected.', 35, 'more', at(0, '20:30'))
  log('a4', 'u1', 'Beautiful but predictable. I knew what to expect.', 32, 'same', at(0, '20:34'))
  log('a4', 'u3', 'Cried a little. Do not tell anyone.', 32, 'more', at(0, '20:41'))

  surprise('a5', 0, 'Late-night jazz club', 'u2')
  log('a5', 'u2', 'Walked past, heard the bass, walked in. Stayed until 1am.', 18, 'more', at(0, '23:10'))

  // === Day 2: today ===
  plan('a6', 1, 'Versailles day trip', 'u2', '10:00', 45, 'RER C to Versailles-Château.')
  log('a6', 'u1', 'The gardens went on forever. Skipped half the palace to stay outside.', 50, 'same', at(1, '15:00'))

  plan('a7', 1, 'Picnic at Trocadéro', 'u1', '19:30', 15, 'Cheese, bread, the tower lit up at dusk.')

  // === Day 3: still ahead ===
  plan('a8', 2, 'Montmartre wander', 'u2', '11:00', null, 'No itinerary. Just walk.')
  plan('a9', 2, 'Sacré-Cœur at sunset', 'u1', '20:00', null, 'Bring a jacket.')

  return {
    trips: [
      {
        id: tripId,
        name: 'Paris weekend',
        emoji: '🗼',
        start_date: toISODate(start),
        day_count: 3,
        member_ids: ['u1', 'u2', 'u3'],
        created_by: 'u2',
        created_at: new Date().toISOString(),
      },
    ],
    activities,
    experiences,
  }
}
