import { useTripUIStore } from '@/store/trip'
import { useLocaleStore } from '@/store/locale'

interface DaySelectorProps {
  startDate: string
  dayCount: number
}

export function DaySelector({ startDate, dayCount }: DaySelectorProps) {
  const selectedDayIndex = useTripUIStore((s) => s.selectedDayIndex)
  const setSelectedDayIndex = useTripUIStore((s) => s.setSelectedDayIndex)
  const locale = useLocaleStore((s) => s.locale)

  // Parse YYYY-MM-DD as a local date — `new Date('2026-05-16')` is UTC midnight
  // and shows the previous day in negative-offset timezones.
  const [year, month, day] = startDate.split('-').map(Number)

  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(year, month - 1, day + i)
    return {
      index: i,
      label: d.toLocaleDateString(locale, { weekday: 'short' }),
      date: d.getDate(),
    }
  })

  return (
    <div className="flex gap-2.5 px-5 pt-5 pb-4 overflow-x-auto scrollbar-none">
      {days.map((day) => {
        const active = day.index === selectedDayIndex
        return (
          <button
            key={day.index}
            type="button"
            onClick={() => setSelectedDayIndex(day.index)}
            className="tf-press flex-1 min-w-[72px] shrink-0 flex items-center justify-center gap-1.5 py-2.5 rounded-[24px] text-[13px] font-bold"
            style={{
              background: active ? 'var(--color-accent)' : 'var(--color-card)',
              color: active ? '#ffffff' : 'var(--color-text-primary)',
              boxShadow: active
                ? '0 2px 10px rgba(91, 191, 173, 0.3)'
                : '0 1px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <span className={active ? 'opacity-90' : 'text-text-muted'}>{day.label}</span>
            <span className="tabular-nums">{day.date}</span>
          </button>
        )
      })}
    </div>
  )
}
