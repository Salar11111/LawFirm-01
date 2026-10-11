'use client'

import { useEffect, useState } from 'react'
import { api, formatDate, formatPKR, formatFileSize, statusBadgeClass, initials, timeAgo } from '@/lib/helpers'
import type { Case, User, DocumentItem, Invoice, CaseUpdate } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Gavel,
  Scale,
  CalendarClock,
  Download,
  FileText,
  Receipt,
  Landmark,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CASE_STATUS_LABELS,
  PRIORITY_LABELS,
  UPDATE_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
} from './labels'

interface Props {
  caseId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UPDATE_TINTS: Record<string, string> = {
  NOTE: 'bg-muted text-muted-foreground',
  FILING: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  HEARING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  RULING: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  DOCUMENT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

export function CaseDetailDialog({ caseId, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {/* Remount the body on each open / caseId change so loading state resets via useState initializer */}
        {open && caseId ? <CaseDetailBody key={caseId} caseId={caseId} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function CaseDetailBody({ caseId }: { caseId: string }) {
  const [data, setData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api<{ case: Case }>(`/api/cases/${caseId}`)
      .then(({ case: c }) => {
        if (!cancelled) setData(c)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [caseId])

  const lawyer = data?.lawyer as User | undefined
  const updates = (data?.updates ?? []) as CaseUpdate[]
  const docs = (data?.documents ?? []) as DocumentItem[]
  const invoices = (data?.invoices ?? []) as Invoice[]

  return (
    <>
      <DialogHeader className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5 px-6 py-5">
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{data?.caseNumber ?? '—'}</span>
              {data && (
                <Badge className={cn('border-transparent text-[10px]', statusBadgeClass(data.status))}>
                  {CASE_STATUS_LABELS[data.status] ?? data.status}
                </Badge>
              )}
              {data && (
                <Badge variant="outline" className="border-border text-[10px] uppercase text-muted-foreground">
                  {PRIORITY_LABELS[data.priority] ?? data.priority} priority
                </Badge>
              )}
            </div>
            <DialogTitle className="font-serif text-xl leading-tight text-foreground sm:text-2xl">
              {data?.title ?? (loading ? <Skeleton className="h-7 w-3/4" /> : 'Case')}
            </DialogTitle>
            <DialogDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-accent" /> {data?.practiceArea ?? '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Landmark className="h-3.5 w-3.5 text-accent" /> {data?.court ?? '—'}
              </span>
              {data?.nextHearing && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5 text-accent" /> Next hearing {formatDate(data.nextHearing)}
                </span>
              )}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(92vh-9rem)]">
        <div className="space-y-5 px-5 py-5 sm:px-6">
          {loading ? (
            <DialogSkeleton />
          ) : !data ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Unable to load case details.</p>
          ) : (
            <>
              {/* Description */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Case Description</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                  {data.description || 'No description available.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
                  <span>Filed: <span className="font-medium text-foreground/70">{formatDate(data.filedDate)}</span></span>
                  {data.closedDate && (
                    <span>Closed: <span className="font-medium text-foreground/70">{formatDate(data.closedDate)}</span></span>
                  )}
                  <span>Last updated: <span className="font-medium text-foreground/70">{timeAgo(data.updatedAt)}</span></span>
                </div>
              </section>

              {/* Lawyer */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Lawyer</h3>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
                  <Avatar className="h-12 w-12 border border-border">
                    {lawyer?.avatar ? <AvatarImage src={lawyer.avatar} alt={lawyer.name} /> : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {lawyer ? initials(lawyer.name) : 'SL'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-sm font-semibold text-foreground">{lawyer?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{lawyer?.specialization ?? 'Legal Counsel'}</p>
                    {lawyer?.barLicense && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">Bar License: {lawyer.barLicense}</p>
                    )}
                  </div>
                  <Scale className="h-5 w-5 text-accent" />
                </div>
              </section>

              {/* Timeline */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Gavel className="h-3.5 w-3.5 text-accent" />
                  Case Timeline ({updates.length})
                </h3>
                {updates.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                    No updates recorded yet.
                  </p>
                ) : (
                  <ol className="relative space-y-1">
                    {updates.map((u, idx) => (
                      <li key={u.id}>
                        <div className="flex gap-3 py-2">
                          <div className="relative flex flex-col items-center">
                            <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold', UPDATE_TINTS[u.updateType] ?? UPDATE_TINTS.NOTE)}>
                              {UPDATE_TYPE_LABELS[u.updateType]?.[0] ?? 'N'}
                            </span>
                            {idx < updates.length - 1 && (
                              <span className="absolute top-9 h-[calc(100%-1rem)] w-px bg-border" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pb-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="text-sm font-semibold text-foreground">{u.title}</p>
                              <Badge variant="outline" className="border-border text-[10px] uppercase text-muted-foreground">
                                {UPDATE_TYPE_LABELS[u.updateType] ?? u.updateType}
                              </Badge>
                            </div>
                            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{u.description}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground/80">{timeAgo(u.createdAt)} · {formatDate(u.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* Documents */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  Documents ({docs.length})
                </h3>
                {docs.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
                    No documents attached to this case.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {docs.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                            <Badge variant="outline" className="border-border px-1.5 py-0 text-[9px] uppercase text-muted-foreground">
                              {DOCUMENT_TYPE_LABELS[d.type] ?? d.type}
                            </Badge>
                            <span>{formatFileSize(d.fileSize)}</span>
                            <span className="hidden sm:inline">· {d.uploader?.name ?? 'Staff'}</span>
                            <span className="hidden sm:inline">· {formatDate(d.createdAt)}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
                          aria-label={`Download ${d.title}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Invoices */}
              {invoices.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5 text-accent" />
                    Invoices ({invoices.length})
                  </h3>
                  <ul className="space-y-2">
                    {invoices.map((inv) => (
                      <li key={inv.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                          <Receipt className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                          <p className="truncate text-sm font-medium text-foreground">{inv.description}</p>
                          <p className="text-[11px] text-muted-foreground">Due {formatDate(inv.dueDate)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-serif text-sm font-bold text-foreground">{formatPKR(inv.amount)}</span>
                          <Badge className={cn('border-transparent text-[9px]', statusBadgeClass(inv.status))}>
                            {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </>
  )
}

function DialogSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    </div>
  )
}
