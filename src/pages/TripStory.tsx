import { useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { useT, type Translations } from '@/lib/i18n'
import { startOfToday, tripPhase } from '@/lib/dates'
import { buildTripStory } from '@/lib/summary'
import { userColor } from '@/lib/userColor'
import { buildTripActivities, useDataStore, type LocalTrip } from '@/store/data'
import type { ActivityWithExperiences, Verdict } from '@/types'

export function TripStory() {
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
  return <StoryView trip={trip} />
}

const BAR: Record<Verdict, string> = {
  more: 'var(--color-accent)',
  same: '#d9d4cc',
  less: 'var(--color-danger)',
}

function StoryView({ trip }: { trip: LocalTrip }) {
  const t = useT()
  const users = useDataStore((s) => s.users)
  const allActivities = useDataStore((s) => s.activities)
  const experiences = useDataStore((s) => s.experiences)
  const [today] = useState(startOfToday)

  const story = useMemo(() => {
    const activities = buildTripActivities(trip, allActivities, experiences, users, today)
    const members = trip.member_ids.flatMap((id) => users.filter((u) => u.id === id))
    return buildTripStory(activities, members)
  }, [trip, allActivities, experiences, users, today])

  const phase = tripPhase(trip.start_date, trip.day_count, today)
  const totalVerdicts = story.verdicts.more + story.verdicts.same + story.verdicts.less
  const diff = story.money.actual - story.money.planned

  const sections: ReactNode[] = []

  if (totalVerdicts > 0) {
    sections.push(
      <Section key="felt" label={t.howItFelt}>
        <div className="flex h-3 rounded-full overflow-hidden bg-warm">
          {(['more', 'same', 'less'] as Verdict[]).map((v) =>
            story.verdicts[v] > 0 ? (
              <motion.div
                key={v}
                initial={{ width: 0 }}
                animate={{ width: `${(story.verdicts[v] / totalVerdicts) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                style={{ background: BAR[v] }}
              />
            ) : null,
          )}
        </div>
        <div className="mt-3 flex justify-between text-[12px] font-bold">
          <span className="text-accent-dark">
            {t.pillMore} {story.verdicts.more}
          </span>
          <span className="text-text-body">
            {t.pillSame} {story.verdicts.same}
          </span>
          <span className="text-danger">
            {t.pillLess} {story.verdicts.less}
          </span>
        </div>
      </Section>,
    )
  }

  sections.push(
    <Section key="money" label={t.planVsReality}>
      {story.money.compared === 0 ? (
        <p className="text-[13px] text-text-muted">{t.noMoney}</p>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[12px] font-semibold text-text-muted">{t.planned}</p>
              <p className="text-[22px] font-extrabold text-text-body tabular-nums">
                ~{story.money.planned}€
              </p>
            </div>
            <span
              className="mb-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full tabular-nums"
              style={{
                background: diff > 0 ? 'var(--color-danger-light)' : 'var(--color-accent-light)',
                color: diff > 0 ? 'var(--color-danger)' : 'var(--color-accent-dark)',
              }}
            >
              {diff > 0 ? '+' : ''}
              {diff}€
            </span>
            <div className="text-right">
              <p className="text-[12px] font-semibold text-text-muted">{t.spent}</p>
              <p className="text-[22px] font-extrabold text-text-primary tabular-nums">
                {story.money.actual}€
              </p>
            </div>
          </div>
          <p className="text-[12px] text-text-muted mt-1">{t.acrossPlans(story.money.compared)}</p>
        </>
      )}
      {story.money.surprises > 0 && (
        <p className="text-[12px] font-bold text-surprise-dark mt-2">
          ✦ {t.surprisesAdded(story.money.surprises)}
        </p>
      )}
    </Section>,
  )

  if (story.highlight) {
    sections.push(
      <Section key="hl" label={t.highlight} tone="accent">
        <QuoteCard activity={story.highlight} t={t} />
      </Section>,
    )
  }

  if (story.biggestSurprise) {
    sections.push(
      <Section key="sur" label={t.biggestSurprise} tone="surprise">
        <QuoteCard activity={story.biggestSurprise} t={t} />
      </Section>,
    )
  }

  if (story.divergences.length > 0) {
    sections.push(
      <Section key="div" label={t.seenDifferently}>
        <div className="space-y-3">
          {story.divergences.map((d) => (
            <div key={d.activity.id}>
              <p className="text-[14px] font-bold text-text-primary">{d.activity.title}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2.5 py-1 rounded-full bg-accent text-white">
                  {t.pillMore} · {d.wow.join(', ')}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-danger text-white">
                  {t.pillLess} · {d.meh.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>,
    )
  }

  if (story.neverHappened.length > 0) {
    sections.push(
      <Section key="ghost" label={t.plansThatStayed} tone="ghost">
        <ul className="space-y-1.5">
          {story.neverHappened.map((a) => (
            <li key={a.id} className="text-[14px] text-text-muted italic">
              {a.title}
            </li>
          ))}
        </ul>
      </Section>,
    )
  }

  if (story.voices.some((v) => v.count > 0)) {
    sections.push(
      <Section key="voices" label={t.whoToldIt}>
        <div className="flex flex-wrap gap-4">
          {story.voices.map(({ user, count }) => (
            <div key={user.id} className="flex items-center gap-2">
              <span
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                style={{ background: userColor(user.id) }}
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-text-primary">{user.name}</p>
                <p className="text-[12px] text-text-muted">{t.voices(count)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>,
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-dvh pb-28">
      <header className="px-5 pt-4 flex items-center gap-3">
        <Link
          to={`/trip/${trip.id}`}
          aria-label="Back"
          className="tf-press w-9 h-9 rounded-full bg-warm flex items-center justify-center text-[18px] text-text-primary"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="text-[18px] font-extrabold text-text-primary truncate">
            {trip.emoji} {trip.name}
          </h1>
          <p className="text-[12px] text-text-muted">
            {t.tripStory.replace(/^\S+\s/, '')}
            {phase !== 'reflecting' && ` · ${t.soFar}`}
          </p>
        </div>
      </header>

      {phase === 'reflecting' && story.ghosts > 0 && (
        <p
          className="mx-5 mt-4 rounded-[14px] px-3.5 py-3 text-[13px] font-semibold text-text-body"
          style={{ background: 'var(--color-warm)' }}
        >
          {t.postTripNudge(trip.name)}
        </p>
      )}

      {/* stats */}
      <div className="grid grid-cols-3 gap-2.5 px-5 pt-4">
        <Stat value={story.lived} label={t.statLived} color="var(--color-accent-dark)" />
        <Stat value={story.surprises} label={t.statSurprises} color="var(--color-surprise-dark)" />
        {phase === 'reflecting' || story.ahead === 0 ? (
          <Stat value={story.ghosts} label={t.statGhosts} color="var(--color-text-muted)" />
        ) : (
          <Stat value={story.ahead} label={t.statAhead} color="var(--color-text-body)" />
        )}
      </div>

      {story.lived === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <span className="text-[44px] tf-anim-bounce">📖</span>
          <p className="text-[14px] text-text-muted mt-3">{t.storyEmpty}</p>
        </div>
      ) : (
        <div className="px-5 pt-3 space-y-3">
          {sections.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              {node}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="tf-card py-3 flex flex-col items-center">
      <span className="text-[24px] font-extrabold tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-[11px] font-bold text-text-muted">{label}</span>
    </div>
  )
}

function Section({
  label,
  tone = 'plain',
  children,
}: {
  label: string
  tone?: 'plain' | 'accent' | 'surprise' | 'ghost'
  children: ReactNode
}) {
  const style =
    tone === 'accent'
      ? {
          background: 'linear-gradient(135deg, #e4f5f1, #f3faf8)',
          borderLeft: '4px solid var(--color-accent)',
        }
      : tone === 'surprise'
        ? {
            background: 'linear-gradient(135deg, var(--color-surprise-light), #ffffff)',
            border: '1.5px dashed rgba(255, 167, 38, 0.45)',
          }
        : tone === 'ghost'
          ? { border: '1.5px dashed #d9d4cc' }
          : { background: 'var(--color-card)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }
  const labelColor =
    tone === 'accent'
      ? 'text-accent-dark'
      : tone === 'surprise'
        ? 'text-surprise-dark'
        : 'text-text-muted'
  return (
    <section className="rounded-[20px] p-4" style={style}>
      <h2 className={`text-[11px] font-bold uppercase tracking-[0.04em] mb-2.5 ${labelColor}`}>
        {label}
      </h2>
      {children}
    </section>
  )
}

function QuoteCard({ activity, t }: { activity: ActivityWithExperiences; t: Translations }) {
  // the most enthusiastic voice tells it
  const quote =
    activity.experiences.find((e) => e.verdict === 'more') ?? activity.experiences[0]
  return (
    <div>
      <p className="text-[15px] font-bold text-text-primary">{activity.title}</p>
      {quote && (
        <>
          <p className="text-[14px] text-text-body leading-[20px] mt-1.5">“{quote.note}”</p>
          <p className="text-[12px] font-bold text-text-muted mt-1.5">
            {quote.user?.name ?? t.someone} · {t.voices(activity.experiences.length)}
          </p>
        </>
      )}
    </div>
  )
}
