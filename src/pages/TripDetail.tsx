import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ActivityCard } from '@/components/activity/ActivityCard'
import { userColor } from '@/lib/userColor'
import { DaySelector } from '@/components/activity/DaySelector'
import { useTripUIStore } from '@/store/trip'
import { useT } from '@/lib/i18n'
import type { ActivityWithExperiences, User } from '@/types'

// Temporary mock data — remove once Supabase fetch is wired up
const alex: User = {
  id: 'u1',
  email: 'alex@example.com',
  name: 'Alex',
  avatar_url: null,
  created_at: '',
}
const zeynep: User = {
  id: 'u2',
  email: 'zeynep@example.com',
  name: 'Zeynep',
  avatar_url: null,
  created_at: '',
}
const mike: User = {
  id: 'u3',
  email: 'mike@example.com',
  name: 'Mike',
  avatar_url: null,
  created_at: '',
}

const mockTrip = {
  name: 'Paris, May 2026',
  start_date: '2026-05-16',
  day_count: 3,
  country: 'France',
  flag: '🇫🇷',
  emoji: '🗼',
}

const mockActivities: ActivityWithExperiences[] = [
  // === Day 1 — lived, multi-voice ===
  {
    id: 'a1',
    trip_id: 't1',
    day_index: 0,
    title: 'Café de Flore breakfast',
    planned_time: '09:00',
    planned_cost: 25,
    planned_note: 'Famous for the croissants.',
    created_by: 'u2',
    created_at: '',
    state: 'experienced',
    created_by_user: zeynep,
    experiences: [
      {
        id: 'e1a',
        activity_id: 'a1',
        note: 'The croissants were unbelievable. Worth every euro.',
        actual_cost: 32,
        verdict: 'more',
        logged_by: 'u2',
        logged_at: '',
        user: zeynep,
      },
      {
        id: 'e1b',
        activity_id: 'a1',
        note: 'Croissants good, coffee average. Service was slow.',
        actual_cost: 30,
        verdict: 'same',
        logged_by: 'u1',
        logged_at: '',
        user: alex,
      },
    ],
  },
  {
    id: 'a2',
    trip_id: 't1',
    day_index: 0,
    title: 'Louvre Museum',
    planned_time: '11:30',
    planned_cost: 22,
    planned_note: 'Mona Lisa, obviously.',
    created_by: 'u2',
    created_at: '',
    state: 'experienced',
    created_by_user: zeynep,
    experiences: [
      {
        id: 'e2a',
        activity_id: 'a2',
        note: 'Three hours in and we had seen maybe 10%. The crowd around Mona Lisa was its own art piece.',
        actual_cost: 22,
        verdict: 'same',
        logged_by: 'u1',
        logged_at: '',
        user: alex,
      },
      {
        id: 'e2b',
        activity_id: 'a2',
        note: 'Beautiful pieces but exhausting. I gave up by the Egyptian wing.',
        actual_cost: 22,
        verdict: 'less',
        logged_by: 'u2',
        logged_at: '',
        user: zeynep,
      },
      {
        id: 'e2c',
        activity_id: 'a2',
        note: 'Could have spent a whole day here. The Italian rooms are stunning.',
        actual_cost: 22,
        verdict: 'more',
        logged_by: 'u3',
        logged_at: '',
        user: mike,
      },
    ],
  },
  {
    id: 'a3',
    trip_id: 't1',
    day_index: 0,
    title: 'Crepe stand near the river',
    planned_time: null,
    planned_cost: null,
    planned_note: null,
    created_by: 'u1',
    created_at: '',
    state: 'unplanned',
    created_by_user: alex,
    experiences: [
      {
        id: 'e3a',
        activity_id: 'a3',
        note: 'Stumbled on this on the way back. Best crepe of the trip.',
        actual_cost: 8,
        verdict: 'more',
        logged_by: 'u1',
        logged_at: '',
        user: alex,
      },
      {
        id: 'e3b',
        activity_id: 'a3',
        note: 'Followed Alex. Worth the detour.',
        actual_cost: 7,
        verdict: 'more',
        logged_by: 'u3',
        logged_at: '',
        user: mike,
      },
    ],
  },
  {
    id: 'a4',
    trip_id: 't1',
    day_index: 0,
    title: 'Eiffel Tower at sunset',
    planned_time: '18:00',
    planned_cost: 30,
    planned_note: 'Hopefully not too crowded.',
    created_by: 'u1',
    created_at: '',
    state: 'experienced',
    created_by_user: alex,
    experiences: [
      {
        id: 'e4a',
        activity_id: 'a4',
        note: 'The line took an hour but the city at dusk was worth it. Colder up there than we expected.',
        actual_cost: 35,
        verdict: 'more',
        logged_by: 'u2',
        logged_at: '',
        user: zeynep,
      },
      {
        id: 'e4b',
        activity_id: 'a4',
        note: 'Beautiful but predictable. I knew what to expect.',
        actual_cost: 32,
        verdict: 'same',
        logged_by: 'u1',
        logged_at: '',
        user: alex,
      },
      {
        id: 'e4c',
        activity_id: 'a4',
        note: 'Cried a little. Do not tell anyone.',
        actual_cost: 32,
        verdict: 'more',
        logged_by: 'u3',
        logged_at: '',
        user: mike,
      },
    ],
  },
  {
    id: 'a5',
    trip_id: 't1',
    day_index: 0,
    title: 'Late-night jazz club',
    planned_time: null,
    planned_cost: null,
    planned_note: null,
    created_by: 'u2',
    created_at: '',
    state: 'unplanned',
    created_by_user: zeynep,
    experiences: [
      {
        id: 'e5a',
        activity_id: 'a5',
        note: 'Walked past, heard the bass, walked in. Stayed until 1am.',
        actual_cost: 18,
        verdict: 'more',
        logged_by: 'u2',
        logged_at: '',
        user: zeynep,
      },
    ],
  },

  // === Day 2 — mix ===
  {
    id: 'a6',
    trip_id: 't1',
    day_index: 1,
    title: 'Versailles day trip',
    planned_time: '10:00',
    planned_cost: 45,
    planned_note: 'RER C to Versailles-Château.',
    created_by: 'u2',
    created_at: '',
    state: 'experienced',
    created_by_user: zeynep,
    experiences: [
      {
        id: 'e6a',
        activity_id: 'a6',
        note: 'The gardens went on forever. Skipped half the palace to stay outside.',
        actual_cost: 50,
        verdict: 'same',
        logged_by: 'u1',
        logged_at: '',
        user: alex,
      },
      {
        id: 'e6b',
        activity_id: 'a6',
        note: 'I want to come back in summer when everything is in bloom.',
        actual_cost: 48,
        verdict: 'more',
        logged_by: 'u2',
        logged_at: '',
        user: zeynep,
      },
    ],
  },
  {
    id: 'a7',
    trip_id: 't1',
    day_index: 1,
    title: 'Picnic at Trocadéro',
    planned_time: '19:30',
    planned_cost: 15,
    planned_note: 'Cheese, bread, the tower lit up at dusk.',
    created_by: 'u1',
    created_at: '',
    state: 'ghost',
    experiences: [],
    created_by_user: alex,
  },

  // === Day 3 — all plan-only, best place to see ghosts under reflecting ===
  {
    id: 'a8',
    trip_id: 't1',
    day_index: 2,
    title: 'Montmartre wander',
    planned_time: '11:00',
    planned_cost: null,
    planned_note: 'No itinerary. Just walk.',
    created_by: 'u2',
    created_at: '',
    state: 'plan-only',
    experiences: [],
    created_by_user: zeynep,
  },
  {
    id: 'a9',
    trip_id: 't1',
    day_index: 2,
    title: 'Sacré-Cœur at sunset',
    planned_time: '20:00',
    planned_cost: null,
    planned_note: 'Bring a jacket.',
    created_by: 'u1',
    created_at: '',
    state: 'plan-only',
    experiences: [],
    created_by_user: alex,
  },
]

const tripMembers: User[] = [alex, zeynep, mike]
// Demo: the trip is viewed as Zeynep
const currentUser = zeynep

function sortByPlannedTime(
  activities: ActivityWithExperiences[],
): ActivityWithExperiences[] {
  return activities.slice().sort((a, b) => {
    if (a.planned_time === null && b.planned_time === null) return 0
    if (a.planned_time === null) return 1
    if (b.planned_time === null) return -1
    return a.planned_time.localeCompare(b.planned_time)
  })
}

export function TripDetail() {
  const selectedDayIndex = useTripUIStore((s) => s.selectedDayIndex)
  const t = useT()
  const navigate = useNavigate()

  const dayActivities = sortByPlannedTime(
    mockActivities.filter((a) => a.day_index === selectedDayIndex),
  )

  // Unplanned moments were lived too; ghosts are still waiting for their story
  const lived = mockActivities.filter(
    (a) => a.state === 'experienced' || a.state === 'unplanned',
  ).length
  const awaiting = mockActivities.filter(
    (a) => a.state === 'plan-only' || a.state === 'ghost',
  ).length
  const soulsLabel = t.daysSouls(mockTrip.day_count, tripMembers.length)

  return (
    <div className="flex-1 flex flex-col min-h-dvh pb-24">
      {/* HEADER */}
      <header className="px-5 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate('/')}
            className="tf-press w-9 h-9 rounded-full bg-warm flex items-center justify-center text-[18px] text-text-primary"
          >
            ‹
          </button>

          <p className="text-[16px] font-bold text-text-primary">
            {t.helloPrefix}
            <span className="text-accent">{currentUser.name}</span> 👋
          </p>

          <div className="flex -space-x-2">
            {tripMembers.map((m) => (
              <div
                key={m.id}
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{
                  background: userColor(m.id),
                  border: '2px solid var(--color-surface)',
                }}
              >
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>

        {/* hero circle + trip name */}
        <div className="flex justify-center pt-5 pb-2">
          <div
            className="relative w-[150px] h-[150px] rounded-full flex items-center justify-center text-[64px]"
            style={{
              background: 'linear-gradient(135deg, #d4ede8, var(--color-accent-light), #faf3e8)',
              boxShadow: '0 4px 24px rgba(91, 191, 173, 0.2)',
            }}
          >
            <span className="tf-anim-bounce">{mockTrip.emoji}</span>
            <span
              className="absolute -bottom-2 bg-card rounded-[20px] px-4 py-1.5 text-[13px] font-bold whitespace-nowrap"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            >
              {mockTrip.name}
            </span>
          </div>
        </div>

        {/* days/souls + status */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-accent-light text-accent-dark text-[13px] font-bold px-[18px] py-2 rounded-[24px]">
            🌍 {soulsLabel}
          </span>
          <div className="flex items-center gap-2 text-[12px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-accent-dark">
              <span
                className="w-[6px] h-[6px] rounded-full bg-accent tf-anim-dot-pulse"
                aria-hidden
              />
              {t.live}
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted">{t.livedAwaiting(lived, awaiting)}</span>
          </div>
        </div>
      </header>

      {/* DAY SELECTOR */}
      <DaySelector
        startDate={mockTrip.start_date}
        dayCount={mockTrip.day_count}
      />

      {/* ACTIVITY LIST */}
      <div className="px-5 space-y-3 flex-1">
        {dayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-[44px] tf-anim-bounce">📖</span>
            <p className="text-[14px] text-text-muted mt-3">{t.emptyDay}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {dayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <ActivityCard activity={activity} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label={t.addMomentToDay(selectedDayIndex + 1)}
        title={t.addMomentToDay(selectedDayIndex + 1)}
        className="tf-press fixed z-20 w-[52px] h-[52px] rounded-full bg-accent text-white text-[28px] font-light flex items-center justify-center"
        style={{
          right: 'max(20px, calc(50% - 195px))',
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 4px 16px rgba(91, 191, 173, 0.4)',
        }}
      >
        +
      </button>
    </div>
  )
}
