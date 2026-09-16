import { Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function AppShell() {
  return (
    <div className="min-h-dvh bg-surface flex flex-col max-w-[430px] mx-auto relative">
      <LanguageSwitcher />
      <Outlet />
    </div>
  )
}
