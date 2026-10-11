'use client'

import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/shared/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FileText,
  Receipt,
  MessageSquare,
  UserRound,
  LogOut,
  Home,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/helpers'
import type { User } from '@/lib/types'

export type PortalSection =
  | 'overview'
  | 'cases'
  | 'appointments'
  | 'documents'
  | 'invoices'
  | 'messages'
  | 'profile'

interface NavItem {
  id: PortalSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'cases', label: 'My Cases', icon: Briefcase },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

interface SidebarProps {
  activeSection: PortalSection
  onSectionChange: (section: PortalSection) => void
  user: User
  onNavigate?: () => void
}

export function PortalSidebar({
  activeSection,
  onSectionChange,
  user,
  onNavigate,
}: SidebarProps) {
  const setView = useAppStore((s) => s.setView)
  const logout = useAppStore((s) => s.logout)

  const handleSelect = (id: PortalSection) => {
    onSectionChange(id)
    onNavigate?.()
  }

  const goHome = () => {
    setView('home')
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3" aria-label="Client portal navigation">
        <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground')} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer: user + actions */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={goHome}
          className="mb-2 w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Home className="h-4 w-4" />
          Back to Website
        </Button>
        <Separator className="mb-3 bg-sidebar-border" />
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2.5">
          <Avatar className="h-9 w-9 border border-sidebar-border bg-primary">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.name}</p>
            <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <Scale className="h-3 w-3 text-accent" />
              Client
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { logout(); onNavigate?.() }}
          className="mt-2 w-full justify-center gap-2 border-sidebar-border bg-transparent"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
