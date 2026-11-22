import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { CloudGate } from '@/components/layout/CloudGate'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { SyncToast } from '@/components/layout/SyncToast'
import { bootCloud } from '@/lib/cloud'

export function AppShell() {
  useEffect(() => {
    void bootCloud()
  }, [])

  return (
    <div className="min-h-dvh bg-surface flex flex-col max-w-[430px] mx-auto relative">
      <LanguageSwitcher />
      <CloudGate>
        <Outlet />
      </CloudGate>
      <SyncToast />
    </div>
  )
}
