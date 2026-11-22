// Trip dates are stored as local YYYY-MM-DD strings. `new Date('2026-05-16')`
// would be UTC midnight and show the previous day in negative-offset timezones,
// so every parse goes through here.

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Whole days between two local dates (b - a). */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export type TripPhase = 'planning' | 'active' | 'reflecting'

export function tripPhase(startDate: string, dayCount: number, today: Date): TripPhase {
  const offset = daysBetween(parseLocalDate(startDate), today)
  if (offset < 0) return 'planning'
  if (offset < dayCount) return 'active'
  return 'reflecting'
}

/** Index of today within the trip, clamped to the trip's days. */
export function todayIndex(startDate: string, dayCount: number, today: Date): number {
  const offset = daysBetween(parseLocalDate(startDate), today)
  return Math.min(Math.max(offset, 0), dayCount - 1)
}

/** A trip day is "over" once the calendar has moved past it. */
export function isDayOver(startDate: string, dayIndex: number, today: Date): boolean {
  return addDays(parseLocalDate(startDate), dayIndex) < today
}
