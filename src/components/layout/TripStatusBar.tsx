import type { TripStatus } from '@/types'
import { TRIP_STATUS_ORDER, TRIP_STATUS_LABELS } from '@/lib/constants'

interface TripStatusBarProps {
  currentStatus: TripStatus
}

export function TripStatusBar({ currentStatus }: TripStatusBarProps) {
  const currentIndex = TRIP_STATUS_ORDER.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {TRIP_STATUS_ORDER.map((status, i) => {
        const isActive = i === currentIndex
        const isPast = i < currentIndex

        return (
          <div key={status} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-1 w-full rounded-full transition-colors ${
                  isActive
                    ? 'bg-accent'
                    : isPast
                      ? 'bg-accent/40'
                      : 'bg-border'
                }`}
              />
              <span
                className={`text-[10px] mt-1 transition-colors ${
                  isActive
                    ? 'text-accent font-medium'
                    : isPast
                      ? 'text-text-body'
                      : 'text-text-muted'
                }`}
              >
                {TRIP_STATUS_LABELS[status]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
