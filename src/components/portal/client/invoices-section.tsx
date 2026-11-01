'use client'

import { useEffect, useState } from 'react'
import { api, formatDate, formatPKR, statusBadgeClass } from '@/lib/helpers'
import type { Invoice } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Receipt,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { INVOICE_STATUS_LABELS } from './labels'
import { LoadError } from '@/components/portal/load-error'

export function InvoicesSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    api<{ invoices: Invoice[] }>('/api/invoices')
      .then(({ invoices: i }) => {
        if (!cancelled) setInvoices(i ?? [])
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

  const pending = invoices.filter((i) => i.status === 'PENDING')
  const overdue = invoices.filter((i) => i.status === 'OVERDUE')
  const paid = invoices.filter((i) => i.status === 'PAID')
  const outstanding = [...pending, ...overdue].reduce((sum, i) => sum + i.amount, 0)
  const totalPaid = paid.reduce((sum, i) => sum + i.amount, 0)
  const outstandingCount = pending.length + overdue.length
  const paidPct = invoices.length > 0 ? Math.round((paid.length / invoices.length) * 100) : 0

  if (loadError) {
    return (
      <LoadError
        title="Invoices could not be loaded"
        onRetry={() => setAttempt((n) => n + 1)}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-0 border-l-4 border-l-rose-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outstanding</p>
                <p className="mt-1 font-serif text-2xl font-bold text-foreground">
                  {loading ? <Skeleton className="inline-block h-8 w-28" /> : formatPKR(outstanding)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {loading ? '…' : `${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''} due`}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending</p>
                <p className="mt-1 font-serif text-2xl font-bold text-foreground">
                  {loading ? <Skeleton className="inline-block h-8 w-20" /> : formatPKR(pending.reduce((s, i) => s + i.amount, 0))}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {loading ? '…' : `${pending.length} awaiting payment`}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                <Clock className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paid</p>
                <p className="mt-1 font-serif text-2xl font-bold text-foreground">
                  {loading ? <Skeleton className="inline-block h-8 w-28" /> : formatPKR(totalPaid)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {loading ? '…' : `${paid.length} invoice${paid.length !== 1 ? 's' : ''} settled`}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment progress */}
      {!loading && invoices.length > 0 && (
        <Card className="gap-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Payment Progress</p>
              <span className="text-sm font-semibold text-primary">{paidPct}%</span>
            </div>
            <Progress value={paidPct} className="mt-2.5 h-2.5" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              {paid.length} of {invoices.length} invoices paid in full.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
          <TabsTrigger value="overdue" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overdue ({overdue.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="paid" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid ({paid.length})
          </TabsTrigger>
        </TabsList>

        {(['all', 'overdue', 'pending', 'paid'] as const).map((tab) => {
          const list =
            tab === 'all'
              ? invoices
              : tab === 'overdue'
              ? overdue
              : tab === 'pending'
              ? pending
              : paid
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              {loading ? (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {[0, 1, 2].map((i) => (
                    <Card key={i} className="gap-0">
                      <CardContent className="space-y-2.5 p-5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-8 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : list.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Inbox className="h-6 w-6" />
                    </span>
                    <p className="mt-3 font-serif text-base font-semibold text-foreground">No invoices here</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tab === 'all' ? 'No invoices have been issued yet.' : `No ${tab} invoices at the moment.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {list.map((inv) => <InvoiceCard key={inv.id} inv={inv} />)}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

function InvoiceCard({ inv }: { inv: Invoice }) {
  const due = new Date(inv.dueDate)
  const today = new Date()
  const daysLate = inv.status === 'OVERDUE' ? Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Card className={cn('gap-0 overflow-hidden transition-shadow hover:shadow-md', inv.status === 'OVERDUE' && 'border-rose-300 dark:border-rose-900/50')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                <Receipt className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[11px] text-muted-foreground">{inv.invoiceNumber}</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Issued {formatDate(inv.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <Badge className={cn('shrink-0 border-transparent text-[10px]', statusBadgeClass(inv.status))}>
            {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
          </Badge>
        </div>

        <h3 className="mt-3 font-serif text-sm font-semibold leading-snug text-foreground">{inv.description}</h3>

        {inv.case && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            For case <span className="font-mono text-foreground/70">{inv.case.caseNumber}</span> — {inv.case.title}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {inv.status === 'PAID' ? 'Paid on' : 'Due'}
            </p>
            <p className="text-xs font-medium text-foreground">
              {inv.status === 'PAID' && inv.paidDate ? formatDate(inv.paidDate) : formatDate(inv.dueDate)}
            </p>
            {inv.status === 'OVERDUE' && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3 w-3" />
                {daysLate} day{daysLate !== 1 ? 's' : ''} overdue
              </p>
            )}
          </div>
          <p className="font-serif text-2xl font-bold text-foreground">{formatPKR(inv.amount)}</p>
        </div>

        {inv.status !== 'PAID' && (
          <Button className="mt-3 w-full gap-2" size="sm">
            Pay {formatPKR(inv.amount)}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
