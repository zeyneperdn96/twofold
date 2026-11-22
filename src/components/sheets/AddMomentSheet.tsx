import { useState, type FormEvent } from 'react'
import { Field, Sheet, SheetActions, VerdictPicker } from '@/components/sheets/Sheet'
import { inputClass, parseCost } from '@/components/sheets/styles'
import { useT } from '@/lib/i18n'
import { useDataStore, type LocalTrip } from '@/store/data'
import type { Verdict } from '@/types'

type Mode = 'plan' | 'surprise'

interface AddMomentSheetProps {
  open: boolean
  onClose: () => void
  trip: LocalTrip
  dayIndex: number
}

export function AddMomentSheet({ open, onClose, trip, dayIndex }: AddMomentSheetProps) {
  const t = useT()
  return (
    <Sheet open={open} onClose={onClose} title={t.addMomentToDay(dayIndex + 1).replace(/^\+\s*/, '')}>
      <AddMomentForm onClose={onClose} trip={trip} dayIndex={dayIndex} />
    </Sheet>
  )
}

function AddMomentForm({
  onClose,
  trip,
  dayIndex,
}: {
  onClose: () => void
  trip: LocalTrip
  dayIndex: number
}) {
  const t = useT()
  const addPlan = useDataStore((s) => s.addPlan)
  const addSurprise = useDataStore((s) => s.addSurprise)

  const [mode, setMode] = useState<Mode>('plan')
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [cost, setCost] = useState('')
  const [note, setNote] = useState('')
  const [verdict, setVerdict] = useState<Verdict | null>(null)

  // A surprise is a lived moment, so its one sentence is mandatory
  const canSubmit =
    title.trim().length > 0 && (mode === 'plan' || note.trim().length > 0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (mode === 'plan') {
      addPlan({
        trip_id: trip.id,
        day_index: dayIndex,
        title,
        planned_time: time || null,
        planned_cost: parseCost(cost),
        planned_note: note.trim() || null,
      })
    } else {
      addSurprise(
        { trip_id: trip.id, day_index: dayIndex, title },
        { note, actual_cost: parseCost(cost), verdict },
      )
    }
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* mode switch */}
      <div className="flex p-1 rounded-[24px] bg-warm">
        {(['plan', 'surprise'] as Mode[]).map((m) => {
          const active = m === mode
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-[20px] text-[13px] font-bold transition-colors"
              style={{
                background: active ? 'var(--color-card)' : 'transparent',
                color: active
                  ? m === 'plan'
                    ? 'var(--color-accent-dark)'
                    : 'var(--color-surprise-dark)'
                  : 'var(--color-text-muted)',
                boxShadow: active ? '0 1px 6px rgba(0, 0, 0, 0.06)' : 'none',
              }}
            >
              {m === 'plan' ? t.modePlan : t.modeSurprise}
            </button>
          )
        })}
      </div>

      <Field label={t.momentTitle}>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={mode === 'plan' ? t.momentPlaceholder : t.surprisePlaceholder}
          maxLength={80}
          autoFocus
        />
      </Field>

      {mode === 'plan' ? (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label={t.time} optional>
                <input
                  type="time"
                  className={inputClass}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label={t.costPerPerson} optional>
                <input
                  inputMode="decimal"
                  className={inputClass}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>
          </div>
          <Field label={t.addActivity} optional>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.hopeNotePlaceholder}
              maxLength={200}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label={t.logExperience}>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.experiencePrompt}
              maxLength={240}
            />
          </Field>
          <Field label={t.yourCost} optional>
            <input
              inputMode="decimal"
              className={inputClass}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label={t.comparedToHope} optional>
            <VerdictPicker value={verdict} onChange={setVerdict} />
          </Field>
        </>
      )}

      <SheetActions
        onCancel={onClose}
        submitLabel={t.addToDay(dayIndex + 1)}
        disabled={!canSubmit}
      />
    </form>
  )
}
