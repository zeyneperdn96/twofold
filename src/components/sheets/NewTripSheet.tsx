import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field, Sheet, SheetActions } from '@/components/sheets/Sheet'
import { inputClass } from '@/components/sheets/styles'
import { startOfToday, toISODate } from '@/lib/dates'
import { useT } from '@/lib/i18n'
import { createTrip } from '@/lib/actions'
import { isCloud } from '@/lib/supabase'

const TRIP_EMOJIS = ['✈️', '🗼', '🏖️', '🏔️', '🏛️', '🌸', '🍜', '🚗']
const MAX_DAYS = 14

export function NewTripSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()
  return (
    <Sheet open={open} onClose={onClose} title={t.newTripTitle}>
      <NewTripForm onClose={onClose} />
    </Sheet>
  )
}

function NewTripForm({ onClose }: { onClose: () => void }) {
  const t = useT()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(TRIP_EMOJIS[0])
  const [start, setStart] = useState(() => toISODate(startOfToday()))
  const [days, setDays] = useState(3)
  const [companions, setCompanions] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(start) && !saving

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    const id = await createTrip({
      name,
      emoji,
      start_date: start,
      day_count: days,
      companions: companions.split(','),
    })
    if (!id) {
      setSaving(false)
      return
    }
    onClose()
    navigate(`/trip/${id}`, { state: isCloud ? { invite: true } : undefined })
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
        {TRIP_EMOJIS.map((e) => {
          const active = e === emoji
          return (
            <button
              key={e}
              type="button"
              aria-pressed={active}
              onClick={() => setEmoji(e)}
              className="tf-press shrink-0 w-12 h-12 rounded-full text-[24px] flex items-center justify-center"
              style={{
                background: active ? 'var(--color-accent-light)' : 'var(--color-card)',
                border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
              }}
            >
              {e}
            </button>
          )
        })}
      </div>

      <Field label={t.tripName}>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.tripNamePlaceholder}
          maxLength={60}
          autoFocus
        />
      </Field>

      <div className="flex gap-3">
        <div className="flex-[3] min-w-0">
          <Field label={t.firstDay}>
            <input
              type="date"
              className={inputClass}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="flex-[2]">
          <Field label={t.dayCount}>
            <div className="flex items-center justify-between bg-card rounded-[14px] border border-border px-1.5 py-1.5">
              <button
                type="button"
                aria-label="−"
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="tf-press w-9 h-9 rounded-full bg-warm text-[18px] font-bold text-text-body"
              >
                −
              </button>
              <span className="text-[16px] font-extrabold tabular-nums">{days}</span>
              <button
                type="button"
                aria-label="+"
                onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
                className="tf-press w-9 h-9 rounded-full bg-accent-light text-[18px] font-bold text-accent-dark"
              >
                +
              </button>
            </div>
          </Field>
        </div>
      </div>

      {isCloud ? (
        <p className="text-[12px] text-text-muted">{t.inviteAfterCreate}</p>
      ) : (
        <Field label={t.whoIsComing} hint={t.companionsHint} optional>
          <input
            className={inputClass}
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            placeholder="Alex, Mike"
          />
        </Field>
      )}

      <SheetActions onCancel={onClose} submitLabel={t.createTrip} disabled={!canSubmit} />
    </form>
  )
}
