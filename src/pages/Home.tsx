import { Link } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { useLocaleStore } from '@/store/locale'

// Temporary mock data — mirrors the demo trip in TripDetail
const demoTrip = {
  id: 't1',
  name: 'Paris, May 2026',
  emoji: '🗼',
  start: new Date(2026, 4, 16),
  end: new Date(2026, 4, 18),
  days: 3,
  souls: 3,
}

export function Home() {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const dates = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).formatRange(demoTrip.start, demoTrip.end)

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-1">
        <h1 className="text-[24px] font-extrabold text-text-primary">TwoFold ✈️</h1>
        <button
          type="button"
          aria-label={t.newTrip}
          title={t.newTrip}
          className="tf-press w-10 h-10 rounded-full bg-accent text-white text-[22px] flex items-center justify-center"
          style={{ boxShadow: '0 2px 10px rgba(91, 191, 173, 0.35)' }}
        >
          +
        </button>
      </header>
      <p className="px-5 text-[13px] text-text-muted">{t.appTagline}</p>

      {/* Trip list */}
      <div className="flex-1 px-5 pt-5 space-y-3">
        <Link
          to={`/trip/${demoTrip.id}`}
          className="tf-card tf-press flex items-center gap-3.5 p-4"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-[28px] shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-light), #d4ede8)' }}
          >
            {demoTrip.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-text-primary truncate">{demoTrip.name}</h2>
            <p className="text-[12px] text-text-muted mt-0.5">
              {dates} · {t.daysSouls(demoTrip.days, demoTrip.souls)}
            </p>
          </div>
          <span className="shrink-0 bg-accent-light text-accent-dark text-[11px] font-bold px-2.5 py-1 rounded-[20px]">
            {t.live}
          </span>
        </Link>
      </div>
    </div>
  )
}
