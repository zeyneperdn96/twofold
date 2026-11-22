import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useT, type Translations } from '@/lib/i18n'
import type { Verdict } from '@/types'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

/** Bottom sheet in the TwoFold style: cream panel, rounded top, mint actions. */
export function Sheet({ open, onClose, title, subtitle, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(45, 45, 45, 0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-[430px] bg-surface rounded-t-[28px] px-5 pt-3 max-h-[92dvh] overflow-y-auto scrollbar-none"
            style={{
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-border mb-4" aria-hidden />
            <h2 className="text-[20px] font-extrabold text-text-primary">{title}</h2>
            {subtitle && <p className="text-[13px] text-text-muted mt-0.5">{subtitle}</p>}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string
  hint?: string
  optional?: boolean
  children: ReactNode
}) {
  const t = useT()
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[0.04em] text-text-muted mb-1.5">
        {label}
        {optional && (
          <span className="normal-case tracking-normal font-semibold"> · {t.optional}</span>
        )}
      </span>
      {children}
      {hint && <span className="block text-[12px] text-text-muted mt-1">{hint}</span>}
    </label>
  )
}

export function SheetActions({
  onCancel,
  submitLabel,
  disabled,
}: {
  onCancel: () => void
  submitLabel: string
  disabled?: boolean
}) {
  const t = useT()
  return (
    <div className="flex gap-2.5 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="tf-press flex-1 py-3 rounded-[24px] text-[14px] font-bold text-text-body bg-warm"
      >
        {t.cancel}
      </button>
      <button
        type="submit"
        disabled={disabled}
        className="tf-press flex-[2] py-3 rounded-[24px] text-[14px] font-bold text-white bg-accent disabled:opacity-40 disabled:active:scale-100"
        style={{ boxShadow: disabled ? 'none' : '0 2px 10px rgba(91, 191, 173, 0.35)' }}
      >
        {submitLabel}
      </button>
    </div>
  )
}

function verdictLabel(t: Translations, v: Verdict) {
  if (v === 'more') return t.pillMore
  if (v === 'same') return t.pillSame
  return t.pillLess
}

const VERDICT_ACTIVE: Record<Verdict, string> = {
  more: 'var(--color-accent)',
  same: 'var(--color-text-primary)',
  less: 'var(--color-danger)',
}

export function VerdictPicker({
  value,
  onChange,
}: {
  value: Verdict | null
  onChange: (v: Verdict | null) => void
}) {
  const t = useT()
  const options: Verdict[] = ['less', 'same', 'more']
  return (
    <div className="flex gap-2" role="radiogroup">
      {options.map((v) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : v)}
            className="tf-press flex-1 py-2.5 rounded-[24px] text-[11px] font-bold uppercase"
            style={{
              background: active ? VERDICT_ACTIVE[v] : 'var(--color-card)',
              color: active ? '#ffffff' : 'var(--color-text-body)',
              boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.12)' : '0 1px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            {verdictLabel(t, v)}
          </button>
        )
      })}
    </div>
  )
}
