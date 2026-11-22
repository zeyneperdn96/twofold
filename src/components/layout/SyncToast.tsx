import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { clearSyncError, useCloudStore } from '@/lib/cloud'
import { useT } from '@/lib/i18n'

/** A short note when a write was refused; the data has already been reloaded. */
export function SyncToast() {
  const t = useT()
  const syncError = useCloudStore((s) => s.syncError)

  useEffect(() => {
    if (!syncError) return
    const id = window.setTimeout(clearSyncError, 4000)
    return () => window.clearTimeout(id)
  }, [syncError])

  return (
    <AnimatePresence>
      {syncError && (
        <motion.div
          role="status"
          className="fixed z-50 left-1/2 top-4 w-[calc(100%-40px)] max-w-[390px] rounded-[16px] px-4 py-3 text-[13px] font-semibold text-white"
          style={{ background: 'var(--color-text-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
          initial={{ opacity: 0, y: -12, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -12, x: '-50%' }}
          onClick={clearSyncError}
        >
          {t.syncError}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
