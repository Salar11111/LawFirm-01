'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  FileText,
  Receipt,
  Scale,
  MessageSquare,
  Inbox,
  LogOut,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/helpers'
import type { User } from '@/lib/types'

export type AdminSection =
  | 'dashboard'
  | 'cases'
  | 'clients'
  | 'appointments'
  | 'documents'
  | 'invoices'
  | 'team'
  | 'messages'
  | 'inquiries'

interface NavGroup {
  label: string
  items: { id: AdminSection; label: string; icon: LucideIcon }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { id: 'cases', label: 'Cases', icon: Briefcase },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'appointments', label: 'Appointments', icon: CalendarDays },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'invoices', label: 'Invoices', icon: Receipt },
    ],
  },
  {
    label: 'Communication',
    items: [
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'inquiries', label: 'Inquiries', icon: Inbox },
    ],
  },
  {
    label: 'Firm',
    items: [{ id: 'team', label: 'Legal Team', icon: Scale }],
  },
]

function FirmMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          <path d="M12 2 L4 7 L4 11 L12 8 L20 11 L20 7 Z" fill="currentColor" opacity="0.9" />
          <path d="M12 9 L9 14 L12 13 L15 14 Z" fill="currentColor" />
          <rect x="11.3" y="13.5" width="1.4" height="6.5" fill="currentColor" />
          <path d="M7 16 L11.3 15 L11.3 16.5 L7 17.5 Z" fill="currentColor" opacity="0.85" />
          <path d="M17 16 L12.7 15 L12.7 16.5 L17 17.5 Z" fill="currentColor" opacity="0.85" />
        </svg>
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="font-serif text-base font-bold tracking-tight text-foreground">Shaheen Law</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Admin Portal
        </span>
      </span>
    </div>
  )
}

interface SidebarContentProps {
  active: AdminSection
  onSelect: (section: AdminSection) => void
  user: User
}

export function SidebarContent({ active, onSelect, user }: SidebarContentProps) {
  const router = useRouter()
  const logout = useAppStore((s) => s.logout)
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="border-b border-sidebar-border px-5 py-4">
        <FirmMark />
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground',
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-3">
          <Avatar className="h-10 w-10 border border-background">
            <AvatarFallback className="bg-primary text-primary-foreground font-serif text-sm font-bold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'shrink-0 text-[10px] font-semibold uppercase',
              isAdmin ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary',
            )}
          >
            {user.role}
          </Badge>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push('/')}
          >
            <Globe className="h-3.5 w-3.5" />
            Website
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => { void logout().then(() => router.push('/')) }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
