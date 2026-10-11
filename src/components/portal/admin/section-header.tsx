'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ReactNode } from 'react'
import { CalendarPlus, Search } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  actions?: ReactNode
  showBookButton?: boolean
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  showBookButton = true,
}: SectionHeaderProps) {
  const openBooking = useAppStore((s) => s.openBooking)

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {search !== undefined && onSearchChange && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full pl-9 sm:w-64"
              />
            </div>
          )}
          {actions}
          {showBookButton && (
            <Button size="sm" className="gap-2" onClick={() => openBooking()}>
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Book Consultation</span>
              <span className="sm:hidden">Book</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
