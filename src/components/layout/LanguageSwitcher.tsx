import { useLocaleStore } from '@/store/locale'
import { LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)

  return (
    <div
      className="fixed z-30 flex items-center gap-0.5 p-1 rounded-full bg-card"
      style={{
        left: 'max(20px, calc(50% - 195px))',
        bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      }}
    >
      {LOCALES.map((l: Locale) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-label={`Switch language to ${LOCALE_LABEL[l]}`}
            aria-pressed={active}
            className="px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors"
            style={{
              background: active ? 'var(--color-accent)' : 'transparent',
              color: active ? '#ffffff' : 'var(--color-text-muted)',
            }}
          >
            {LOCALE_LABEL[l]}
          </button>
        )
      })}
    </div>
  )
}
