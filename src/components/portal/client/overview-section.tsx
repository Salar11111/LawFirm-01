'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { api, formatDate, formatPKR, timeAgo, statusBadgeClass, initials } from '@/lib/helpers'
import type { Case, Appointment, Invoice, DocumentItem, CaseUpdate, User } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Briefcase,
  CalendarClock,
  Receipt,
  FileStack,
  ArrowRight,
  Gavel,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UPDATE_TYPE_LABELS, CASE_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from './labels'
import type { PortalSection } from './portal-sidebar'

const ACTIVE_STATUSES = ['PENDING', 'ACTIVE', 'HEARING', 'ADJOURNED']

interface UpdateFeedItem extends CaseUpdate {
  caseTitle: string
  caseNumber: string
}

export function OverviewSection({ onNavigate }: { onNavigate: (s: PortalSection) => void }) {
  const user = useAppStore((s) => s.user)
  const openBooking = useAppStore((s) => s.openBooking)

  const [cases, setCases] = useState<Case[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [updatesFeed, setUpdatesFeed] = useState<UpdateFeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<{ cases: Case[] }>('/api/cases'),
      api<{ appointments: Appointment[] }>('/api/appointments'),
      api<{ invoices: Invoice[] }>('/api/invoices'),
      api<{ documents: DocumentItem[] }>('/api/documents'),
    ])
      .then(async ([c, a, i, d]) => {
        if (cancelled) return
        const caseList = c.cases ?? []
        const aptList = a.appointments ?? []
        const invList = i.invoices ?? []
        const docList = d.documents ?? []
        setCases(caseList)
        setAppointments(aptList)
        setInvoices(invList)
        setDocuments(docList)

        // Build recent updates feed from the 3 most recently updated cases
        const top = caseList.slice(0, 3)
        const details = await Promise.all(
          top.map((cs) => api<{ case: Case }>(`/api/cases/${cs.id}`).catch(() => null)),
        )
        if (cancelled) return
        const feed: UpdateFeedItem[] = []
        details.forEach((res, idx) => {
          if (!res?.case?.updates) return
          res.case.updates.forEach((u) => {
            feed.push({
              ...u,
              caseTitle: top[idx].title,
              caseNumber: top[idx].caseNumber,
            })
          })
        })
        feed.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
        setUpdatesFeed(feed.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeCases = cases.filter((c) => ACTIVE_STATUSES.includes(c.status)).length
  const now = new Date()
  const upcomingApts = appointments
    .filter((a) => new Date(a.date) >= now && a.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE')
  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <div className="absolute inset-0 bg-pattern-dots opacity-[0.15]" aria-hidden />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
              <Sparkles className="h-4 w-4 text-accent" />
              {greeting}
            </p>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              {user?.name?.split(' ')[0] ?? 'Welcome'}
            </h2>
            <p className="mt-1.5 text-sm text-primary-foreground/75">
              Here&apos;s a snapshot of your legal matters at Shaheen Law Associates.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => onNavigate('cases')}
              variant="secondary"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              View My Cases
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => openBooking()}
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <CalendarDays className="h-4 w-4" />
              Book Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active Cases"
          value={loading ? null : String(activeCases)}
          icon={Briefcase}
          tint="emerald"
          onClick={() => onNavigate('cases')}
        />
        <StatCard
          label="Upcoming Appointments"
          value={loading ? null : String(upcomingApts.length)}
          icon={CalendarClock}
          tint="gold"
          onClick={() => onNavigate('appointments')}
        />
        <StatCard
          label="Pending Invoices"
          value={loading ? null : formatPKR(pendingTotal)}
          icon={Receipt}
          tint="rose"
          onClick={() => onNavigate('invoices')}
        />
        <StatCard
          label="Documents"
          value={loading ? null : String(documents.length)}
          icon={FileStack}
          tint="sky"
          onClick={() => onNavigate('documents')}
        />
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent updates */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg">Recent Case Updates</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Latest activity across your cases</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('cases')} className="gap-1 text-primary">
              All cases <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : updatesFeed.length === 0 ? (
              <EmptyHint icon={Gavel} title="No updates yet" hint="Case updates from your legal team will appear here." />
            ) : (
              <ol className="relative space-y-1">
                {updatesFeed.map((u, idx) => (
                  <li key={u.id}>
                    <div className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60">
                      <div className="relative flex flex-col items-center">
                        <span
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                            u.updateType === 'HEARING'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : u.updateType === 'RULING'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : u.updateType === 'FILING'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {UPDATE_TYPE_LABELS[u.updateType]?.[0] ?? 'N'}
                        </span>
                        {idx < updatesFeed.length - 1 && (
                          <span className="absolute top-9 h-[calc(100%-1.5rem)] w-px bg-border" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-semibold text-foreground">{u.title}</p>
                          <Badge variant="outline" className="border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {UPDATE_TYPE_LABELS[u.updateType] ?? u.updateType}
                          </Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{u.description}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                          <span className="font-medium text-foreground/70">{u.caseNumber}</span> · {u.caseTitle} · {timeAgo(u.createdAt)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg">Upcoming Appointments</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Your scheduled meetings</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('appointments')} className="gap-1 text-primary">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : upcomingApts.length === 0 ? (
              <EmptyHint
                icon={CalendarDays}
                title="No upcoming appointments"
                hint="Book a consultation with one of our lawyers."
                action={
                  <Button size="sm" onClick={() => openBooking()} className="mt-3 gap-2">
                    <CalendarDays className="h-4 w-4" /> Book Consultation
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2.5">
                {upcomingApts.slice(0, 4).map((a) => {
                  const lawyer = a.lawyer as User | undefined
                  return (
                    <li
                      key={a.id}
                      className="rounded-xl border border-border bg-card p-3.5 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <span className="text-[10px] font-semibold uppercase">{formatDate(a.date, { month: 'short' }).split(' ')[0]}</span>
                          <span className="font-serif text-lg font-bold leading-none">{new Date(a.date).getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{a.subject}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {APPOINTMENT_TYPE_LABELS[a.type] ?? a.type} · {a.time} · {a.duration} min
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <Avatar className="h-5 w-5 border border-border">
                              {lawyer?.avatar ? <AvatarImage src={lawyer.avatar} alt={lawyer.name} /> : null}
                              <AvatarFallback className="bg-primary/15 text-[9px] font-semibold text-primary">
                                {lawyer ? initials(lawyer.name) : 'SL'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-[11px] text-muted-foreground">{lawyer?.name ?? 'Lawyer'}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cases at a glance */}
      {!loading && cases.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg">Your Cases</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{cases.length} case{cases.length !== 1 ? 's' : ''} on file</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('cases')} className="gap-1 text-primary">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cases.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onNavigate('cases')}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{c.caseNumber}</span>
                    <Badge className={cn('border-transparent text-[10px]', statusBadgeClass(c.status))}>
                      {CASE_STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  </div>
                  <p className="font-serif text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{c.title}</p>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{c.practiceArea}</span>
                    <span>{c.nextHearing ? `Next: ${formatDate(c.nextHearing)}` : 'No hearing'}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | null
  icon: React.ComponentType<{ className?: string }>
  tint: 'emerald' | 'gold' | 'rose' | 'sky'
  onClick?: () => void
}

const TINTS: Record<StatCardProps['tint'], string> = {
  emerald: 'bg-primary/10 text-primary',
  gold: 'bg-accent/20 text-accent-foreground',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
}

function StatCard({ label, value, icon: Icon, tint, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:p-5"
    >
      <div className="flex items-center justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', TINTS[tint])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div>
        {value === null ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="font-serif text-2xl font-bold leading-none text-foreground">{value}</p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </button>
  )
}

function EmptyHint({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  hint: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{hint}</p>
      {action}
    </div>
  )
}
