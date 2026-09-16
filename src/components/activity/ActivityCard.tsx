import { motion } from 'framer-motion'
import { useT, type Translations } from '@/lib/i18n'
import { userColor } from '@/lib/userColor'
import type {
  ActivityWithExperiences,
  ExperienceWithUser,
  Verdict,
} from '@/types'

type IconCategory = 'sunset' | 'food' | 'museum' | 'walk' | 'drink' | 'default'

// Soft tints behind the activity emoji
const ICON_TINTS: Record<IconCategory, string> = {
  sunset: '#fff1e0',
  food: '#fff6dd',
  museum: '#f3ecfb',
  walk: '#e4f5f1',
  drink: '#fdecf1',
  default: '#e8f1fa',
}

function categorize(title: string): { category: IconCategory; emoji: string } {
  const t = title.toLowerCase()
  if (/sunset|sunrise|eiffel|cœur|coeur/.test(t))
    return { category: 'sunset', emoji: '🌅' }
  if (/breakfast|café|cafe|crepe|picnic|food|brunch|dinner|lunch/.test(t))
    return { category: 'food', emoji: '🥐' }
  if (/museum|louvre|gallery|exhibit/.test(t))
    return { category: 'museum', emoji: '🖼️' }
  if (/walk|wander|montmartre|stroll|hike|garden|versailles/.test(t))
    return { category: 'walk', emoji: '🌿' }
  if (/jazz|bar|drink|cocktail|club|pub|wine/.test(t))
    return { category: 'drink', emoji: '🍷' }
  if (/tower|palace|cathedral|church/.test(t))
    return { category: 'default', emoji: '🗼' }
  return { category: 'default', emoji: '✨' }
}

// Average of the group's verdicts (more = +1, same = 0, less = -1).
// Only a clear lean wins: a split like WOW / AS HOPED (avg 0.5) or
// WOW / AS HOPED / MEH (avg 0) reads as 'same', never favouring one side on a tie.
const VERDICT_SCORE: Record<Verdict, number> = { more: 1, same: 0, less: -1 }

function aggregateVerdict(experiences: ExperienceWithUser[]): Verdict | null {
  const scores = experiences.flatMap((e) => (e.verdict ? [VERDICT_SCORE[e.verdict]] : []))
  if (scores.length === 0) return null
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
  if (avg > 0.5) return 'more'
  if (avg < -0.5) return 'less'
  return 'same'
}

function pillText(t: Translations, v: Verdict): string {
  if (v === 'more') return t.pillMore
  if (v === 'same') return t.pillSame
  return t.pillLess
}

// Solid pill in the experience box, one colour per group verdict
const VERDICT_PILL: Record<Verdict, { background: string; color: string }> = {
  more: { background: 'var(--color-accent)', color: '#ffffff' },
  same: { background: 'var(--color-card)', color: 'var(--color-text-primary)' },
  less: { background: 'var(--color-danger)', color: '#ffffff' },
}

// logged_at is an ISO timestamp from the DB — show it as HH:MM, not raw
function formatLoggedTime(loggedAt: string | undefined): string {
  if (!loggedAt) return ''
  const d = new Date(loggedAt)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface ActivityCardProps {
  activity: ActivityWithExperiences
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const t = useT()
  if (activity.state === 'unplanned')
    return <UnplannedCard activity={activity} t={t} />
  if (activity.state === 'plan-only')
    return <PlanOnlyCard activity={activity} t={t} />
  if (activity.state === 'ghost')
    return <GhostCard activity={activity} t={t} />
  return <ExperiencedCard activity={activity} t={t} />
}

// === Common header (icon + title + time) ===
function CardHeader({
  activity,
  voices,
  t,
}: {
  activity: ActivityWithExperiences
  voices?: number
  t: Translations
}) {
  const { category, emoji } = categorize(activity.title)

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
        style={{ background: ICON_TINTS[category] }}
      >
        <span>{emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-text-primary leading-tight truncate">
          {activity.title}
        </h3>
        {activity.planned_time && (
          <span className="inline-block mt-1 text-[11px] font-semibold text-text-muted bg-warm px-2 py-[2px] rounded-[8px] tabular-nums">
            {activity.planned_time}
          </span>
        )}
      </div>
      {voices !== undefined && voices > 0 && (
        <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap bg-accent-light text-accent-dark">
          {t.voices(voices)}
        </span>
      )}
    </div>
  )
}

// === Plan box (reused by experienced + plan-only) ===
function PlanBox({
  activity,
  future,
  t,
}: {
  activity: ActivityWithExperiences
  future: boolean
  t: Translations
}) {
  return (
    <div className="bg-warm rounded-[14px] px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[12px]">💭</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-text-muted">
          {future ? t.weHopeFor : t.weHopedFor}
        </span>
      </div>
      {activity.planned_note && (
        <p className="text-[14px] text-text-body leading-[20px]">
          {activity.planned_note}
        </p>
      )}
      {activity.planned_cost !== null && (
        <p className="text-[12px] font-semibold text-text-muted mt-1 tabular-nums">
          ~{activity.planned_cost}€
        </p>
      )}
    </div>
  )
}

// === Card 1: Experienced ===
function ExperiencedCard({
  activity,
  t,
}: {
  activity: ActivityWithExperiences
  t: Translations
}) {
  const verdict = aggregateVerdict(activity.experiences)
  // planned_cost is per person, so compare it with the average of logged costs
  // (a missing cost means "not logged", never "free")
  const loggedCosts = activity.experiences.flatMap((e) =>
    e.actual_cost !== null ? [e.actual_cost] : [],
  )
  const avgActual =
    loggedCosts.length > 0
      ? Math.round(loggedCosts.reduce((sum, c) => sum + c, 0) / loggedCosts.length)
      : null

  return (
    <article className="tf-card p-4">
      <CardHeader activity={activity} voices={activity.experiences.length} t={t} />

      <div className="mt-3">
        <PlanBox activity={activity} future={false} t={t} />
      </div>

      <motion.div
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: 'top', backfaceVisibility: 'hidden' }}
        className="mt-2"
      >
        <div
          className="rounded-[14px] px-3.5 py-3"
          style={{
            background: 'linear-gradient(135deg, #e4f5f1, #f3faf8)',
            borderLeft: '4px solid var(--color-accent)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px]">✨</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-accent-dark">
                {t.whatHappened}
              </span>
            </div>
            {verdict && (
              <span
                className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                style={{
                  ...VERDICT_PILL[verdict],
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                }}
              >
                {pillText(t, verdict)}
              </span>
            )}
          </div>

          <div className="mt-2.5 space-y-2.5">
            {activity.experiences.map((exp) => (
              <ExperienceLine key={exp.id} experience={exp} t={t} />
            ))}
          </div>

          <div
            className="mt-3 pt-2.5 flex items-center justify-between gap-3"
            style={{ borderTop: '1px dashed rgba(61, 158, 142, 0.3)' }}
          >
            <span className="text-[12px] text-text-muted flex items-center gap-1 min-w-0">
              📍 <span className="truncate">{activity.title}</span>
            </span>
            {avgActual !== null && (
              <span className="text-[14px] font-bold text-text-primary tabular-nums shrink-0">
                {avgActual}€{' '}
                <span className="text-[11px] font-semibold text-text-muted">{t.perPerson}</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </article>
  )
}

function ExperienceLine({
  experience,
  t,
}: {
  experience: ExperienceWithUser
  t: Translations
}) {
  const name = experience.user?.name ?? t.someone
  const initial = name.charAt(0).toUpperCase()
  const color = experience.user ? userColor(experience.user.id) : '#cbd5e1'
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: color }}
        >
          {initial}
        </span>
        <span className="text-[12px] font-bold text-text-primary">{name}</span>
      </div>
      <p className="text-[14px] text-text-body leading-[20px] pl-[28px] mt-0.5">
        “{experience.note}”
      </p>
    </div>
  )
}

// === Card 2: Plan-only ===
function PlanOnlyCard({
  activity,
  t,
}: {
  activity: ActivityWithExperiences
  t: Translations
}) {
  return (
    <article className="tf-card p-4">
      <CardHeader activity={activity} t={t} />

      <div className="mt-3">
        <PlanBox activity={activity} future={true} t={t} />
      </div>

      <div
        className="mt-2 rounded-[14px] p-4 flex flex-col items-center text-center"
        style={{
          background: '#f7fcfb',
          border: '1.5px dashed rgba(91, 191, 173, 0.5)',
        }}
      >
        <span className="text-[26px] tf-anim-bounce">✨</span>
        <p className="text-[13px] text-accent-dark font-semibold mt-1">
          {t.howWasItReally}
        </p>
        <button
          type="button"
          className="tf-press mt-3 px-6 py-2.5 rounded-[14px] text-[13px] font-bold text-white bg-accent"
          style={{ boxShadow: '0 2px 10px rgba(91, 191, 173, 0.3)' }}
        >
          {t.tellTheStory}
        </button>
      </div>
    </article>
  )
}

// === Card 3.5: Ghost (planned, day passed, never logged) ===
function GhostCard({
  activity,
  t,
}: {
  activity: ActivityWithExperiences
  t: Translations
}) {
  return (
    <article
      className="rounded-[20px] p-4"
      style={{ border: '1.5px dashed #d9d4cc' }}
    >
      <div style={{ opacity: 0.55 }}>
        <CardHeader activity={activity} t={t} />
      </div>

      <div
        className="mt-3 rounded-[14px] px-3.5 py-3"
        style={{ background: 'rgba(240, 237, 232, 0.6)' }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-text-muted">
          {t.weHopedFor}
        </span>
        {activity.planned_note && (
          <p className="text-[14px] text-text-muted leading-[20px] italic mt-1">
            {activity.planned_note}
          </p>
        )}
        {activity.planned_cost !== null && (
          <p className="text-[12px] text-text-muted mt-1 tabular-nums">
            ~{activity.planned_cost}€
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[13px] text-text-muted italic leading-snug">
          {t.ghostCard}
        </p>
        <button
          type="button"
          className="tf-press shrink-0 text-[12px] font-bold text-text-body px-3.5 py-2 rounded-full bg-card"
          style={{ border: '1px dashed #cfc9c0' }}
        >
          {t.tellTheStory}
        </button>
      </div>
    </article>
  )
}

// === Card 3: Unplanned ===
function UnplannedCard({
  activity,
  t,
}: {
  activity: ActivityWithExperiences
  t: Translations
}) {
  const { emoji } = categorize(activity.title)

  return (
    <article
      className="relative rounded-[20px] p-4 mt-2"
      style={{
        background: 'linear-gradient(135deg, var(--color-surprise-light), #ffffff)',
        border: '1.5px dashed rgba(255, 167, 38, 0.45)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      }}
    >
      <span
        className="absolute -top-[9px] left-4 px-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-surprise-dark bg-surface"
      >
        {t.unplannedBadge}
      </span>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-text-primary flex items-center gap-2 min-w-0">
          <span className="text-[18px]">{emoji}</span>
          <span className="truncate">{activity.title}</span>
        </h3>
        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 text-white bg-surprise">
          {t.surprise}
        </span>
      </div>

      {/* every member who was there keeps their own line */}
      {activity.experiences.map((exp) => (
        <UnplannedVoice key={exp.id} experience={exp} t={t} />
      ))}
    </article>
  )
}

function UnplannedVoice({
  experience,
  t,
}: {
  experience: ExperienceWithUser
  t: Translations
}) {
  const authorName = experience.user?.name ?? t.someone
  const color = experience.user ? userColor(experience.user.id) : '#cbd5e1'
  const time = formatLoggedTime(experience.logged_at)

  return (
    <div
      className="mt-3 pt-2.5"
      style={{ borderTop: '1px dashed rgba(255, 167, 38, 0.3)' }}
    >
      <p className="text-[14px] text-text-body leading-[20px]">“{experience.note}”</p>
      <div className="mt-2 flex items-center gap-2 text-[12px] text-text-muted">
        <span
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: color }}
        >
          {authorName.charAt(0).toUpperCase()}
        </span>
        <span className="font-bold text-text-primary">{authorName}</span>
        {time && (
          <>
            <span>·</span>
            <span className="tabular-nums">{time}</span>
          </>
        )}
        {experience.actual_cost !== null && (
          <>
            <span>·</span>
            <span className="tabular-nums font-bold text-surprise-dark">
              {experience.actual_cost}€
            </span>
          </>
        )}
      </div>
    </div>
  )
}
