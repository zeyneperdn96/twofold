import type { ActivityWithExperiences, User, Verdict } from '@/types'

// Trip story: computed from what the group logged, no AI involved.

const SCORE: Record<Verdict, number> = { more: 1, same: 0, less: -1 }

export interface MoneyLine {
  /** Sum of planned per-person costs, only for plans that were lived and costed. */
  planned: number
  /** Average logged cost per person for those same plans. */
  actual: number
  /** Average logged cost per person for unplanned moments. */
  surprises: number
  /** How many plans could be compared. */
  compared: number
}

export interface Divergence {
  activity: ActivityWithExperiences
  wow: string[]
  meh: string[]
}

export interface TripStory {
  lived: number
  surprises: number
  ghosts: number
  ahead: number
  verdicts: Record<Verdict, number>
  money: MoneyLine
  highlight: ActivityWithExperiences | null
  biggestSurprise: ActivityWithExperiences | null
  divergences: Divergence[]
  neverHappened: ActivityWithExperiences[]
  voices: { user: User; count: number }[]
}

function avgCost(a: ActivityWithExperiences): number | null {
  const costs = a.experiences.flatMap((e) => (e.actual_cost !== null ? [e.actual_cost] : []))
  if (costs.length === 0) return null
  return costs.reduce((s, c) => s + c, 0) / costs.length
}

function avgScore(a: ActivityWithExperiences): number | null {
  const scores = a.experiences.flatMap((e) => (e.verdict ? [SCORE[e.verdict]] : []))
  if (scores.length === 0) return null
  return scores.reduce((s, c) => s + c, 0) / scores.length
}

/** Higher average verdict wins; more voices breaks ties; earlier day after that. */
function bestOf(list: ActivityWithExperiences[]): ActivityWithExperiences | null {
  let best: ActivityWithExperiences | null = null
  let bestScore = -Infinity
  for (const a of list) {
    const s = avgScore(a)
    if (s === null || s <= 0) continue // a highlight has to lean towards WOW
    const better =
      s > bestScore ||
      (s === bestScore && best !== null && a.experiences.length > best.experiences.length)
    if (better) {
      best = a
      bestScore = s
    }
  }
  return best
}

const round = (n: number) => Math.round(n)

export function buildTripStory(
  activities: ActivityWithExperiences[],
  members: User[],
): TripStory {
  const experienced = activities.filter((a) => a.state === 'experienced')
  const unplanned = activities.filter((a) => a.state === 'unplanned')
  const ghosts = activities.filter((a) => a.state === 'ghost')

  const verdicts: Record<Verdict, number> = { more: 0, same: 0, less: 0 }
  for (const a of [...experienced, ...unplanned])
    for (const e of a.experiences) if (e.verdict) verdicts[e.verdict]++

  let planned = 0
  let actual = 0
  let compared = 0
  for (const a of experienced) {
    const c = avgCost(a)
    if (a.planned_cost === null || c === null) continue
    planned += a.planned_cost
    actual += c
    compared++
  }
  const surprises = unplanned.reduce((s, a) => s + (avgCost(a) ?? 0), 0)

  const divergences: Divergence[] = []
  for (const a of [...experienced, ...unplanned]) {
    const wow = a.experiences.filter((e) => e.verdict === 'more')
    const meh = a.experiences.filter((e) => e.verdict === 'less')
    if (wow.length && meh.length)
      divergences.push({
        activity: a,
        wow: wow.map((e) => e.user?.name ?? '?'),
        meh: meh.map((e) => e.user?.name ?? '?'),
      })
  }

  const voices = members
    .map((user) => ({
      user,
      count: activities.reduce(
        (n, a) => n + a.experiences.filter((e) => e.logged_by === user.id).length,
        0,
      ),
    }))
    .sort((x, y) => y.count - x.count)

  const byDay = (list: ActivityWithExperiences[]) =>
    list.slice().sort((x, y) => x.day_index - y.day_index)

  return {
    lived: experienced.length + unplanned.length,
    surprises: unplanned.length,
    ghosts: ghosts.length,
    ahead: activities.filter((a) => a.state === 'plan-only').length,
    verdicts,
    money: { planned: round(planned), actual: round(actual), surprises: round(surprises), compared },
    highlight: bestOf(byDay(experienced)),
    biggestSurprise: bestOf(byDay(unplanned)),
    divergences,
    neverHappened: byDay(ghosts),
    voices,
  }
}
