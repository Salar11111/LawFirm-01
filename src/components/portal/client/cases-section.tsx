'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { api, formatDate, statusBadgeClass, initials, timeAgo } from '@/lib/helpers'
import type { Case, User } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Briefcase,
  Search,
  Landmark,
  CalendarClock,
  ArrowRight,
  Scale,
  FileText,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CASE_STATUS_LABELS, CASE_STATUS_LABELS as CS, PRIORITY_LABELS } from './labels'
import { CASE_STATUSES } from '@/lib/helpers'
import { CaseDetailDialog } from './case-detail-dialog'
import { LoadError } from '@/components/portal/load-error'

export function CasesSection() {
  const user = useAppStore((s) => s.user)
  const openBooking = useAppStore((s) => s.openBooking)

  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    api<{ cases: Case[] }>('/api/cases')
      .then(({ cases: c }) => {
        if (!cancelled) setCases(c ?? [])
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const filtered = cases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        c.practiceArea.toLowerCase().includes(q)
      )
    }
    return true
  })

  const openCase = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }

  if (loadError) {
    return (
      <LoadError
        title="Cases could not be loaded"
        onRetry={() => setAttempt((n) => n + 1)}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, number, court..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {CASE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{CS[s] ?? s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {loading ? 'Loading…' : `${filtered.length} case${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="gap-0">
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Separator />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="h-7 w-7" />
            </span>
            <p className="mt-4 font-serif text-lg font-semibold text-foreground">
              {cases.length === 0 ? 'No cases yet' : 'No matching cases'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {cases.length === 0
                ? `When you become a client, your legal cases will be tracked here${user ? `, ${user.name.split(' ')[0]}` : ''}.`
                : 'Try adjusting your search or status filter.'}
            </p>
            {cases.length === 0 && (
              <Button onClick={() => openBooking()} className="mt-5 gap-2">
                <Briefcase className="h-4 w-4" /> Book a Consultation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((c) => {
            const lawyer = c.lawyer as User | undefined
            return (
              <Card
                key={c.id}
                className="group gap-0 cursor-pointer overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
                onClick={() => openCase(c.id)}
              >
                <CardContent className="space-y-3.5 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{c.caseNumber}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="border-border text-[9px] uppercase text-muted-foreground">
                        {PRIORITY_LABELS[c.priority] ?? c.priority}
                      </Badge>
                      <Badge className={cn('border-transparent text-[10px]', statusBadgeClass(c.status))}>
                        {CASE_STATUS_LABELS[c.status] ?? c.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-base font-semibold leading-snug text-foreground group-hover:text-primary">
                      {c.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-accent" />
                      {c.practiceArea}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Landmark className="h-3.5 w-3.5 text-accent" />
                      <span className="truncate">{c.court}</span>
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-8 w-8 border border-border">
                        {lawyer?.avatar ? <AvatarImage src={lawyer.avatar} alt={lawyer.name} /> : null}
                        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                          {lawyer ? initials(lawyer.name) : 'SL'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">{lawyer?.name ?? 'Unassigned'}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{lawyer?.specialization ?? 'Legal Counsel'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {c.nextHearing ? formatDate(c.nextHearing) : 'No hearing'}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">Updated {timeAgo(c.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {(c as Case & { _count?: { documents?: number; updates?: number } })._count?.documents ?? 0} docs
                      <span className="mx-1">·</span>
                      {(c as Case & { _count?: { documents?: number; updates?: number } })._count?.updates ?? 0} updates
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                      View details <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CaseDetailDialog
        caseId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
