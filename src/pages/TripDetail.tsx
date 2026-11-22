import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ActivityCard } from '@/components/activity/ActivityCard'
import { userColor } from '@/lib/userColor'
import { DaySelector } from '@/components/activity/DaySelector'
import { useTripUIStore } from '@/store/trip'
import { useT } from '@/lib/i18n'
import { AddMomentSheet } from '@/components/sheets/AddMomentSheet'
import { StorySheet } from '@/components/sheets/StorySheet'
import { InviteSheet } from '@/components/sheets/InviteSheet'
import { removeTrip } from '@/lib/actions'
import { isCloud } from '@/lib/supabase'
import { buildTripActivities, useDataStore, type LocalTrip } from '@/store/data'
import { daysBetween, parseLocalDate, startOfToday, todayIndex, tripPhase } from '@/lib/dates'
import type { ActivityWithExperiences } from '@/types'

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
  const { tripId } = useParams()
  const trip = useDataStore((s) => s.trips.find((tr) => tr.id === tripId))
  const t = useT()

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center min-h-dvh">
        <span className="text-[44px]">🧭</span>
        <p className="text-[14px] text-text-muted mt-3">{t.tripNotFound}</p>
        <Link
          to="/"
          className="tf-press mt-5 px-5 py-2.5 rounded-[24px] bg-accent text-white text-[13px] font-bold"
        >
          {t.backHome}
        </Link>
      </div>
    )
  }
  return <TripView key={trip.id} trip={trip} />
}

function TripView({ trip }: { trip: LocalTrip }) {
  const t = useT()
  const navigate = useNavigate()
  const users = useDataStore((s) => s.users)
  const allActivities = useDataStore((s) => s.activities)
  const experiences = useDataStore((s) => s.experiences)
  const currentUserId = useDataStore((s) => s.currentUserId)
  const storedDayIndex = useTripUIStore((s) => s.selectedDayIndex)
  const setSelectedDayIndex = useTripUIStore((s) => s.setSelectedDayIndex)

  const [today] = useState(startOfToday)
  const [addOpen, setAddOpen] = useState(false)
  const [storyFor, setStoryFor] = useState<ActivityWithExperiences | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // a freshly created cloud trip opens straight on its invite sheet
  const location = useLocation()
  const [inviteOpen, setInviteOpen] = useState(
    () => isCloud && (location.state as { invite?: boolean } | null)?.invite === true,
  )
  const canDelete = !isCloud || trip.created_by === currentUserId

  // Open a trip on today's page (or its first/last day outside the trip)
  useEffect(() => {
    setSelectedDayIndex(todayIndex(trip.start_date, trip.day_count, today))
  }, [trip.start_date, trip.day_count, today, setSelectedDayIndex])
  const selectedDayIndex = Math.min(storedDayIndex, trip.day_count - 1)

  const activities = useMemo(
    () => buildTripActivities(trip, allActivities, experiences, users, today),
    [trip, allActivities, experiences, users, today],
  )
  const tripMembers = useMemo(
    () => trip.member_ids.flatMap((id) => users.filter((u) => u.id === id)),
    [trip.member_ids, users],
  )
  const currentUser = users.find((u) => u.id === currentUserId)

  const dayActivities = sortByPlannedTime(
    activities.filter((a) => a.day_index === selectedDayIndex),
  )

  // Unplanned moments were lived too; ghosts are still waiting for their story
  const lived = activities.filter(
    (a) => a.state === 'experienced' || a.state === 'unplanned',
  ).length
  const awaiting = activities.filter(
    (a) => a.state === 'plan-only' || a.state === 'ghost',
  ).length
  const soulsLabel = t.daysSouls(trip.day_count, tripMembers.length)
  const phase = tripPhase(trip.start_date, trip.day_count, today)
  const phaseLabel =
    phase === 'active'
      ? t.live
      : phase === 'planning'
        ? t.startsIn(daysBetween(today, parseLocalDate(trip.start_date)))
        : t.phaseReflecting

  // keep the open story sheet in sync with the latest data
  const storyActivity = storyFor
    ? (activities.find((a) => a.id === storyFor.id) ?? null)
    : null

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
            <span className="text-accent">{currentUser?.name}</span> 👋
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
            <span className="tf-anim-bounce">{trip.emoji}</span>
            <span
              className="absolute -bottom-2 bg-card rounded-[20px] px-4 py-1.5 text-[13px] font-bold whitespace-nowrap"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}
            >
              {trip.name}
            </span>
          </div>
        </div>

        {/* days/souls + status */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-accent-light text-accent-dark text-[13px] font-bold px-[18px] py-2 rounded-[24px]">
            🌍 {soulsLabel}
          </span>
          <div className="flex items-center gap-2 text-[12px] font-semibold">
            <span
              className={`inline-flex items-center gap-1.5 ${phase === 'active' ? 'text-accent-dark' : 'text-text-body'}`}
            >
              <span
                className={`w-[6px] h-[6px] rounded-full ${phase === 'active' ? 'bg-accent tf-anim-dot-pulse' : 'bg-text-muted'}`}
                aria-hidden
              />
              {phaseLabel}
            </span>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted">{t.livedAwaiting(lived, awaiting)}</span>
          </div>
          <Link
            to={`/trip/${trip.id}/story`}
            className="tf-press mt-1 text-[12px] font-bold px-3.5 py-1.5 rounded-full bg-card text-accent-dark"
            style={{ boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)' }}
          >
            {t.tripStory} →
          </Link>
          {isCloud && trip.join_code && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="tf-press text-[12px] font-bold px-3.5 py-1.5 rounded-full bg-accent text-white"
              style={{ boxShadow: '0 2px 8px rgba(91, 191, 173, 0.3)' }}
            >
              {t.invite}
            </button>
          )}
        </div>
      </header>

      {/* DAY SELECTOR */}
      <DaySelector
        startDate={trip.start_date}
        dayCount={trip.day_count}
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
                <ActivityCard
                  activity={activity}
                  currentUserId={currentUserId}
                  onTellStory={setStoryFor}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* delete trip: two taps, no browser dialog */}
      <div className="flex justify-center pt-10 pb-4">
        {canDelete && (
        <button
          type="button"
          onClick={() => {
            if (!confirmingDelete) {
              setConfirmingDelete(true)
              window.setTimeout(() => setConfirmingDelete(false), 3000)
              return
            }
            removeTrip(trip.id)
            navigate('/')
          }}
          className="tf-press text-[12px] font-semibold px-4 py-2 rounded-full"
          style={{
            color: confirmingDelete ? '#ffffff' : 'var(--color-text-muted)',
            background: confirmingDelete ? 'var(--color-danger)' : 'transparent',
          }}
        >
          {confirmingDelete ? t.confirmDelete : t.deleteTrip}
        </button>
        )}
      </div>
      {isCloud && (
        <InviteSheet trip={trip} open={inviteOpen} onClose={() => setInviteOpen(false)} />
      )}

      <AddMomentSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        trip={trip}
        dayIndex={selectedDayIndex}
      />
      <StorySheet activity={storyActivity} onClose={() => setStoryFor(null)} />

      {/* FAB */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
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
