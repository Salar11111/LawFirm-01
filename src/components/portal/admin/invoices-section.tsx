'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Receipt,
  Plus,
  ChevronDown,
  Inbox,
  Loader2,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, formatPKR, formatDate, statusBadgeClass, INVOICE_STATUSES } from '@/lib/helpers'
import type { Case, Invoice, User } from '@/lib/types'
import { SectionHeader } from './section-header'

const emptyForm = {
  clientId: '',
  caseId: '',
  amount: '',
  description: '',
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  status: 'PENDING',
}

export function InvoicesSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadInvoices = useCallback(async () => {
    const { invoices } = await api<{ invoices: Invoice[] }>('/api/invoices')
    return invoices
  }, [])

  useEffect(() => {
    let cancelled = false
    loadInvoices()
      .then((invoices) => { if (!cancelled) setInvoices(invoices) })
      .catch(() => { if (!cancelled) toast.error('Failed to load invoices') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadInvoices])

  const refetchInvoices = useCallback(() => {
    setLoading(true)
    loadInvoices()
      .then(setInvoices)
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [loadInvoices])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<{ clients: User[] }>('/api/clients'),
      api<{ cases: Case[] }>('/api/cases'),
    ])
      .then(([c, cs]) => {
        if (cancelled) return
        setClients(c.clients)
        setCases(cs.cases)
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load clients and cases') })
    return () => { cancelled = true }
  }, [])

  const { totalRevenue, outstanding, paidCount, pendingCount } = useMemo(() => {
    let rev = 0
    let out = 0
    let paid = 0
    let pend = 0
    invoices.forEach((i) => {
      if (i.status === 'PAID') {
        rev += i.amount
        paid++
      } else {
        out += i.amount
        pend++
      }
    })
    return { totalRevenue: rev, outstanding: out, paidCount: paid, pendingCount: pend }
  }, [invoices])

  const handleStatusChange = (id: string, status: string) => {
    api('/api/invoices', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    })
      .then(() => {
        toast.success(`Invoice marked ${status}`)
        refetchInvoices()
      })
      .catch(() => toast.error('Failed to update invoice'))
  }

  const handleCreate = () => {
    if (!form.clientId) {
      toast.error('Please select a client')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!form.description.trim()) {
      toast.error('Please enter a description')
      return
    }
    setSubmitting(true)
    api<{ invoice: Invoice }>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify({
        clientId: form.clientId,
        caseId: form.caseId || null,
        amount: form.amount,
        description: form.description,
        dueDate: form.dueDate,
        status: form.status,
        items: [],
      }),
    })
      .then(() => {
        toast.success('Invoice created')
        setNewOpen(false)
        setForm(emptyForm)
        refetchInvoices()
      })
      .catch(() => toast.error('Failed to create invoice'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div>
      <SectionHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length === 1 ? '' : 's'} issued`}
        icon={<Receipt className="h-5 w-5" />}
        actions={
          <Button size="sm" className="gap-2" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </Button>
        }
        showBookButton={false}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-primary p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/75">Total Revenue</p>
                <p className="mt-1 font-serif text-2xl font-bold">{formatPKR(totalRevenue)}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-primary-foreground/70">{paidCount} paid invoice{paidCount === 1 ? '' : 's'}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outstanding</p>
                <p className="mt-1 font-serif text-2xl font-bold text-accent-foreground">{formatPKR(outstanding)}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{pendingCount} pending invoice{pendingCount === 1 ? '' : 's'}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Collection Rate</p>
                <p className="mt-1 font-serif text-2xl font-bold text-foreground">
                  {invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0}%
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{invoices.length} total issued</p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-foreground">No invoices yet</p>
              <p className="text-sm text-muted-foreground">Create an invoice to start billing clients.</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Invoice #</TableHead>
                  <TableHead className="min-w-[160px]">Client</TableHead>
                  <TableHead className="hidden lg:table-cell">Case</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-primary">{inv.invoiceNumber}</span>
                        <span className="max-w-[200px] truncate text-xs text-muted-foreground">{inv.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">{inv.client?.name ?? '—'}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {inv.case ? (
                        <span className="font-mono text-xs text-primary">{inv.case.caseNumber}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-serif text-sm font-bold text-foreground">{formatPKR(inv.amount)}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${statusBadgeClass(inv.status)}`}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            Update <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {INVOICE_STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusChange(inv.id, s)}
                              disabled={s === inv.status}
                            >
                              {s === 'PAID' && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                              {s === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                              {s === 'OVERDUE' && <Clock className="h-3.5 w-3.5 text-destructive" />}
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* New invoice dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2 font-serif text-xl">
              <Receipt className="h-5 w-5 text-primary" />
              Create Invoice
            </DialogTitle>
            <DialogDescription>Bill a client for legal services.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(92vh-180px)]">
            <div className="space-y-4 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Client *</Label>
                  <Select
                    value={form.clientId}
                    onValueChange={(v) => setForm((f) => ({ ...f, clientId: v, caseId: '' }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Case (optional)</Label>
                  <Select
                    value={form.caseId}
                    onValueChange={(v) => setForm((f) => ({ ...f, caseId: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {cases
                        .filter((c) => !form.clientId || c.clientId === form.clientId)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.caseNumber} — {c.title.slice(0, 24)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="i-amount">Amount (PKR) *</Label>
                  <Input
                    id="i-amount"
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="i-due">Due Date</Label>
                  <Input
                    id="i-due"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="i-desc">Description *</Label>
                <Textarea
                  id="i-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Legal fees for property transfer matter"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INVOICE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
