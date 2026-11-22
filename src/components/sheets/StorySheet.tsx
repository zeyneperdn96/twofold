import { useState, type FormEvent } from 'react'
import { Field, Sheet, SheetActions, VerdictPicker } from '@/components/sheets/Sheet'
import { inputClass, parseCost } from '@/components/sheets/styles'
import { useT } from '@/lib/i18n'
import { useDataStore } from '@/store/data'
import type { ActivityWithExperiences, Verdict } from '@/types'

interface StorySheetProps {
  activity: ActivityWithExperiences | null
  onClose: () => void
}

/** "How did it actually go?": the current user's side of one moment. */
export function StorySheet({ activity, onClose }: StorySheetProps) {
  const t = useT()
  return (
    <Sheet
      open={activity !== null}
      onClose={onClose}
      title={t.logExperience}
      subtitle={activity?.title}
    >
      {activity && <StoryForm key={activity.id} activity={activity} onClose={onClose} />}
    </Sheet>
  )
}

function StoryForm({
  activity,
  onClose,
}: {
  activity: ActivityWithExperiences
  onClose: () => void
}) {
  const t = useT()
  const currentUserId = useDataStore((s) => s.currentUserId)
  const tellStory = useDataStore((s) => s.tellStory)
  const mine = activity.experiences.find((e) => e.logged_by === currentUserId)

  const [note, setNote] = useState(mine?.note ?? '')
  const [cost, setCost] = useState(
    mine?.actual_cost != null ? String(mine.actual_cost) : '',
  )
  const [verdict, setVerdict] = useState<Verdict | null>(mine?.verdict ?? null)

  const canSubmit = note.trim().length > 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    tellStory(activity.id, { note, actual_cost: parseCost(cost), verdict })
    onClose()
  }

  const hasPlan = activity.state !== 'unplanned' && (activity.planned_note || activity.planned_cost !== null)

  return (
    <form onSubmit={submit} className="space-y-4">
      {hasPlan && (
        <div className="bg-warm rounded-[14px] px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[12px]">💭</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-text-muted">
              {t.weHopedFor}
            </span>
          </div>
          {activity.planned_note && (
            <p className="text-[14px] text-text-body leading-[20px]">{activity.planned_note}</p>
          )}
          {activity.planned_cost !== null && (
            <p className="text-[12px] font-semibold text-text-muted mt-1 tabular-nums">
              ~{activity.planned_cost}€
            </p>
          )}
        </div>
      )}

      <Field label={t.experiencePrompt}>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={240}
          autoFocus
        />
      </Field>

      <Field label={t.yourCost} optional>
        <input
          inputMode="decimal"
          className={inputClass}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder={activity.planned_cost !== null ? String(activity.planned_cost) : '0'}
        />
      </Field>

      <Field label={t.comparedToHope} optional>
        <VerdictPicker value={verdict} onChange={setVerdict} />
      </Field>

      <SheetActions onCancel={onClose} submitLabel={t.saveMySide} disabled={!canSubmit} />
    </form>
  )
}
