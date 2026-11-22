import { useState, type FormEvent, type ReactNode } from 'react'
import { inputClass } from '@/components/sheets/styles'
import { bootCloud, saveName, useCloudStore } from '@/lib/cloud'
import { useT } from '@/lib/i18n'
import { useDataStore } from '@/store/data'

/**
 * Cloud mode only: holds the app until there is a session and a name.
 * With a cached copy of earlier data the app shows immediately while
 * reconnecting. In demo mode this renders its children untouched.
 */
export function CloudGate({ children }: { children: ReactNode }) {
  const t = useT()
  const status = useCloudStore((s) => s.status)
  const error = useCloudStore((s) => s.error)
  const hasCache = useDataStore((s) => s.currentUserId !== '')

  if (status === 'off' || status === 'ready') return <>{children}</>
  if (status === 'connecting' && hasCache) return <>{children}</>

  if (status === 'needs-name') return <NameScreen />

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center min-h-dvh">
      <span className="text-[44px] tf-anim-bounce">✈️</span>
      {status === 'error' ? (
        <>
          <p className="text-[15px] font-bold text-text-primary mt-3">{t.cloudError}</p>
          {error && <p className="text-[12px] text-text-muted mt-1 max-w-[280px]">{error}</p>}
          <button
            type="button"
            onClick={() => void bootCloud()}
            className="tf-press mt-5 px-6 py-2.5 rounded-[24px] bg-accent text-white text-[13px] font-bold"
          >
            {t.retry}
          </button>
        </>
      ) : (
        <p className="text-[14px] text-text-muted mt-3">{t.connecting}</p>
      )}
    </div>
  )
}

function NameScreen() {
  const t = useT()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const canSubmit = name.trim().length > 0 && !saving

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    const ok = await saveName(name)
    if (!ok) setSaving(false)
  }

  return (
    <form
      onSubmit={submit}
      className="flex-1 flex flex-col justify-center px-6 min-h-dvh"
    >
      <div className="flex justify-center">
        <div
          className="w-[120px] h-[120px] rounded-full flex items-center justify-center text-[52px]"
          style={{
            background: 'linear-gradient(135deg, #d4ede8, var(--color-accent-light), #faf3e8)',
            boxShadow: '0 4px 24px rgba(91, 191, 173, 0.2)',
          }}
        >
          <span className="tf-anim-bounce">👋</span>
        </div>
      </div>
      <h1 className="text-[24px] font-extrabold text-text-primary text-center mt-6">
        TwoFold ✈️
      </h1>
      <p className="text-[13px] text-text-muted text-center mt-1">{t.appTagline}</p>

      <label className="block mt-8">
        <span className="block text-[15px] font-bold text-text-primary mb-2">{t.whatsYourName}</span>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoFocus
          autoComplete="given-name"
        />
        <span className="block text-[12px] text-text-muted mt-1.5">{t.nameHint}</span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className="tf-press mt-6 py-3 rounded-[24px] text-[14px] font-bold text-white bg-accent disabled:opacity-40"
        style={{ boxShadow: canSubmit ? '0 2px 10px rgba(91, 191, 173, 0.35)' : 'none' }}
      >
        {t.continueLabel}
      </button>
    </form>
  )
}
