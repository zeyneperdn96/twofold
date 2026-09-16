import type { TripStatus, Verdict } from '@/types'

// === Copy (exact wording — do not change) ===

export const COPY = {
  addActivity: 'What are you hoping for?',
  logExperience: 'How did it actually go?',
  emptyDay: 'This day is still unwritten.',
  experiencePrompt: 'One sentence. How did it go?',
  ghostCard: 'You planned this. Did it happen?',
  postTripNudge: (tripName: string) =>
    `${tripName} is done. Some moments are still unrecorded.`,
  memberDivergence: (name: string) =>
    `You and ${name} saw this one differently.`,
} as const

// === Verdict ===

export const VERDICT_LABELS: Record<Verdict, string> = {
  less: 'Less than expected',
  same: 'As expected',
  more: 'More than expected',
}

export const VERDICT_COLORS: Record<Verdict, string> = {
  less: 'var(--color-verdict-less)',
  same: 'var(--color-verdict-same)',
  more: 'var(--color-verdict-more)',
}

// === Trip Status ===

export const TRIP_STATUS_ORDER: TripStatus[] = [
  'planning',
  'active',
  'reflecting',
  'closed',
]

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  reflecting: 'Reflecting',
  closed: 'Closed',
}
