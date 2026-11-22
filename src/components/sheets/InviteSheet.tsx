import { useState } from 'react'
import { Sheet } from '@/components/sheets/Sheet'
import { useT } from '@/lib/i18n'
import type { LocalTrip } from '@/store/data'

function inviteLink(code: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/join/${code}`
}

export function InviteSheet({
  trip,
  open,
  onClose,
}: {
  trip: LocalTrip
  open: boolean
  onClose: () => void
}) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const code = trip.join_code ?? ''
  const link = inviteLink(code)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked (http, old browser): the link is selectable below
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.inviteTitle} subtitle={`${trip.emoji} ${trip.name}`}>
      <p className="text-[13px] text-text-body leading-[19px]">{t.inviteHint}</p>

      <div className="mt-4 tf-card p-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-text-muted">
          {t.inviteCode}
        </p>
        <p
          className="text-[30px] font-extrabold tracking-[0.18em] text-accent-dark tabular-nums mt-1"
          data-testid="invite-code"
        >
          {code}
        </p>
        <p className="text-[12px] text-text-muted mt-2 break-all select-all" data-testid="invite-link">
          {link}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void copy()}
        className="tf-press w-full mt-4 py-3 rounded-[24px] text-[14px] font-bold text-white bg-accent"
        style={{ boxShadow: '0 2px 10px rgba(91, 191, 173, 0.35)' }}
      >
        {copied ? t.copied : t.copyLink}
      </button>
    </Sheet>
  )
}
