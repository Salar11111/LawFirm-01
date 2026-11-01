'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Users,
  Wallet,
  CalendarClock,
  Award,
  TrendingUp,
  ArrowUpRight,
  Gavel,
  type LucideIcon,
} from 'lucide-react'
import {
  api,
  formatPKR,
  formatDate,
  initials,
  statusBadgeClass,
} from '@/lib/helpers'
import type { Case, Invoice } from '@/lib/types'
import { SectionHeader } from './section-header'
import { LoadError } from '@/components/portal/load-error'
import { AuditFeed, NoticeList } from '@/components/portal/notice-list'

interface FirmStats {
  cases: number
  clients: number
  lawyers: number
  reviews: number
  pendingApts: number
  wonCases: number
  avgRating: number
  successRate: number
}

const CASE_STATUS_COLORS: Record<string, string> = {
  PENDING: 'var(--chart-3)',
  ACTIVE: 'var(--chart-1)',
  HEARING: 'var(--chart-4)',
  ADJOURNED: 'var(--chart-2)',
  CLOSED: 'var(--muted-foreground)',
  WON: 'var(--chart-1)',
  LOST: 'var(--destructive)',
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  loading,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  accent?: boolean
  loading?: boolean
}) {
  return (
    <Card className={accent ? 'bg-primary text-primary-foreground' : ''}>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className={accent ? 'text-xs font-medium uppercase tracking-wider text-primary-foreground/75' : 'text-xs font-medium uppercase tracking-wider text-muted-foreground'}>
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24 bg-primary-foreground/20" />
          ) : (
            <p className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
          )}
          {hint && (
            <p className={accent ? 'mt-1 text-xs text-primary-foreground/70' : 'mt-1 text-xs text-muted-foreground'}>
              {hint}
            </p>
          )}
        </div>
        <div
          className={
            accent
              ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15'
              : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'
          }
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

interface DashboardProps {
  onOpenCase: (caseId: string) => void
}

export function DashboardSection({ onOpenCase }: DashboardProps) {
  const [stats, setStats] = useState<FirmStats | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    Promise.all([
      api<{ stats: FirmStats }>('/api/stats'),
      api<{ cases: Case[] }>('/api/cases'),
      api<{ invoices: Invoice[] }>('/api/invoices'),
    ])
      .then(([s, c, inv]) => {
        if (cancelled) return
        setStats(s.stats)
        setCases(c.cases)
        setInvoices(inv.invoices)
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

  // Derived metrics
  const totalRevenue = useMemo(
    () => invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
    [invoices],
  )
  const outstanding = useMemo(
    () => invoices.filter((i) => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0),
    [invoices],
  )

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach((c) => {
      map[c.status] = (map[c.status] ?? 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [cases])

  const practiceAreaData = useMemo(() => {
    const map: Record<string, number> = {}
    cases.forEach((c) => {
      const label = c.practiceArea.length > 16 ? c.practiceArea.slice(0, 14) + '…' : c.practiceArea
      map[label] = (map[label] ?? 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [cases])

  const revenueTrend = useMemo(() => {
    const months: Record<string, number> = {}
    invoices
      .filter((i) => i.status === 'PAID' && i.paidDate)
      .forEach((i) => {
        const d = new Date(i.paidDate!)
        const key = d.toLocaleDateString('en-PK', { month: 'short' })
        months[key] = (months[key] ?? 0) + i.amount
      })
    const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const recent = order.slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1)
    return recent.map((m) => ({ month: m, revenue: months[m] ?? 0 }))
  }, [invoices])

  const upcomingHearings = useMemo(() => {
    const now = new Date()
    return cases
      .filter((c) => c.nextHearing && new Date(c.nextHearing) >= now)
      .sort((a, b) => new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime())
      .slice(0, 5)
  }, [cases])

  const recentCases = useMemo(() => {
    return [...cases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [cases])

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle="Firm-wide overview of cases, clients, and finances"
        icon={<TrendingUp className="h-5 w-5" />}
        showBookButton={false}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {loadError && !loading ? (
          <LoadError
            title="The dashboard could not be loaded"
            onRetry={() => setAttempt((n) => n + 1)}
          />
        ) : (
        <>
        <NoticeList />
        <AuditFeed />
        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard icon={Briefcase} label="Total Cases" value={String(stats?.cases ?? 0)} loading={loading} />
          <KpiCard icon={Users} label="Active Clients" value={String(stats?.clients ?? 0)} loading={loading} />
          <KpiCard icon={Wallet} label="Revenue" value={formatPKR(totalRevenue)} accent loading={loading} hint="from paid invoices" />
          <KpiCard icon={CalendarClock} label="Pending Apts" value={String(stats?.pendingApts ?? 0)} loading={loading} />
          <KpiCard icon={Award} label="Cases Won" value={String(stats?.wonCases ?? 0)} loading={loading} />
          <KpiCard icon={Gavel} label="Success Rate" value={`${stats?.successRate ?? 0}%`} loading={loading} hint="of closed cases" />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Case status distribution */}
          <Card className="p-5">
            <h3 className="font-serif text-lg font-semibold text-foreground">Case Status</h3>
            <p className="text-xs text-muted-foreground">Distribution by current status</p>
            <div className="mt-4 h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-48 w-48 rounded-full" />
                </div>
              ) : statusDistribution.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={CASE_STATUS_COLORS[entry.name] ?? 'var(--chart-5)'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--popover-foreground)',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Cases by practice area */}
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-serif text-lg font-semibold text-foreground">Cases by Practice Area</h3>
            <p className="text-xs text-muted-foreground">Workload distribution across specialisations</p>
            <div className="mt-4 h-64">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : practiceAreaData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={practiceAreaData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)' }}
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--popover-foreground)',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" name="Cases" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Revenue trend */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground">Monthly Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Collected revenue over the last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Collected</span>
                <p className="font-serif text-lg font-bold text-primary">{formatPKR(totalRevenue)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding</span>
                <p className="font-serif text-lg font-bold text-accent-foreground">{formatPKR(outstanding)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 h-56">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : revenueTrend.every((d) => d.revenue === 0) ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--popover-foreground)',
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatPKR(v), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Recent cases + upcoming hearings */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">Recent Cases</h3>
                <p className="text-xs text-muted-foreground">Latest filed matters</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentCases.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No cases yet.</p>
            ) : (
              <div className="space-y-1">
                {recentCases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onOpenCase(c.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {c.client ? initials(c.client.name) : 'CL'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.caseNumber} · {c.court}
                      </p>
                    </div>
                    <Badge className={`shrink-0 text-[10px] ${statusBadgeClass(c.status)}`}>{c.status}</Badge>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">Upcoming Hearings</h3>
                <p className="text-xs text-muted-foreground">Next scheduled court dates</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : upcomingHearings.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No upcoming hearings.</p>
            ) : (
              <div className="space-y-1">
                {upcomingHearings.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onOpenCase(c.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                      <span className="text-[10px] font-semibold uppercase">
                        {new Date(c.nextHearing!).toLocaleDateString('en-PK', { month: 'short' })}
                      </span>
                      <span className="font-serif text-base font-bold leading-none">
                        {new Date(c.nextHearing!).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.caseNumber} · {c.court}
                      </p>
                    </div>
                    <Badge className={`shrink-0 text-[10px] ${statusBadgeClass(c.priority)}`}>{c.priority}</Badge>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
        </>
        )}
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">No data to display yet</p>
    </div>
  )
}
