import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NewTripSheet } from '@/components/sheets/NewTripSheet'
import { useT } from '@/lib/i18n'
import { addDays, daysBetween, parseLocalDate, startOfToday, tripPhase } from '@/lib/dates'
import { useDataStore, type LocalTrip } from '@/store/data'
import { useLocaleStore } from '@/store/locale'

// Live trips first, then upcoming (soonest first), then memories (latest first)
const PHASE_ORDER = { active: 0, planning: 1, reflecting: 2 } as const

export function Home() {
  const t = useT()
  const trips = useDataStore((s) => s.trips)
  const resetDemo = useDataStore((s) => s.resetDemo)
  const [newOpen, setNewOpen] = useState(false)
  const [today] = useState(startOfToday)

  const sorted = useMemo(
    () =>
      trips
        .map((trip) => ({ trip, phase: tripPhase(trip.start_date, trip.day_count, today) }))
        .sort((a, b) => {
          const byPhase = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase]
          if (byPhase !== 0) return byPhase
          const cmp = a.trip.start_date.localeCompare(b.trip.start_date)
          return a.phase === 'reflecting' ? -cmp : cmp
        }),
    [trips, today],
  )

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-1">
        <h1 className="text-[24px] font-extrabold text-text-primary">TwoFold ✈️</h1>
        <button
          type="button"
          aria-label={t.newTrip}
          title={t.newTrip}
          onClick={() => setNewOpen(true)}
          className="tf-press w-10 h-10 rounded-full bg-accent text-white text-[22px] flex items-center justify-center"
          style={{ boxShadow: '0 2px 10px rgba(91, 191, 173, 0.35)' }}
        >
          +
        </button>
      </header>
      <p className="px-5 text-[13px] text-text-muted">{t.appTagline}</p>

      {/* Trip list */}
      <div className="flex-1 px-5 pt-5 space-y-3">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-[44px] tf-anim-bounce">🧳</span>
            <p className="text-[14px] text-text-muted mt-3">{t.noTrips}</p>
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="tf-press mt-5 px-6 py-2.5 rounded-[24px] bg-accent text-white text-[13px] font-bold"
              style={{ boxShadow: '0 2px 10px rgba(91, 191, 173, 0.3)' }}
            >
              {t.newTrip}
            </button>
          </div>
        ) : (
          sorted.map(({ trip, phase }) => (
            <TripRow key={trip.id} trip={trip} phase={phase} today={today} />
          ))
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button
          type="button"
          onClick={resetDemo}
          className="text-[12px] font-semibold text-text-muted underline underline-offset-2"
        >
          {t.resetDemo}
        </button>
      </div>

      <NewTripSheet open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  )
}

function TripRow({
  trip,
  phase,
  today,
}: {
  trip: LocalTrip
  phase: ReturnType<typeof tripPhase>
  today: Date
}) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const start = parseLocalDate(trip.start_date)
  const end = addDays(start, trip.day_count - 1)
  const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const dates = trip.day_count === 1 ? fmt.format(start) : fmt.formatRange(start, end)

  const badge =
    phase === 'active'
      ? { text: t.live, bg: 'var(--color-accent-light)', color: 'var(--color-accent-dark)' }
      : phase === 'planning'
        ? {
            text: t.startsIn(daysBetween(today, start)),
            bg: 'var(--color-warm)',
            color: 'var(--color-text-body)',
          }
        : { text: t.phaseReflecting, bg: 'var(--color-warm)', color: 'var(--color-text-muted)' }

  return (
    <Link to={`/trip/${trip.id}`} className="tf-card tf-press flex items-center gap-3.5 p-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-[28px] shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-light), #d4ede8)',
          opacity: phase === 'reflecting' ? 0.75 : 1,
        }}
      >
        {trip.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-[15px] font-bold text-text-primary truncate">{trip.name}</h2>
        <p className="text-[12px] text-text-muted mt-0.5">
          {dates} · {t.daysSouls(trip.day_count, trip.member_ids.length)}
        </p>
      </div>
      <span
        className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-[20px] whitespace-nowrap"
        style={{ background: badge.bg, color: badge.color }}
      >
        {badge.text}
      </span>
    </Link>
  )
}
