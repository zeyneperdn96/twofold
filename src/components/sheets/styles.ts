export const inputClass =
  'w-full bg-card rounded-[14px] px-3.5 py-3 text-[15px] text-text-primary placeholder:text-text-muted outline-none border border-border focus:border-accent transition-colors'

/** Parses an optional money field; empty or invalid means "not given", never 0. */
export function parseCost(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}
