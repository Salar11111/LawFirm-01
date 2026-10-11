'use client'

import { useEffect, useState, useCallback } from 'react'
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
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Inbox,
  Eye,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, formatDate, formatDateTime, statusBadgeClass } from '@/lib/helpers'
import type { ContactMessage } from '@/lib/types'
import { SectionHeader } from './section-header'

const INQUIRY_STATUSES = ['NEW', 'READ', 'RESPONDED', 'CLOSED']

export function InquiriesSection() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewMsg, setViewMsg] = useState<ContactMessage | null>(null)

  const loadMessages = useCallback(async () => {
    const { messages } = await api<{ messages: ContactMessage[] }>('/api/contact')
    return messages
  }, [])

  useEffect(() => {
    let cancelled = false
    loadMessages()
      .then((messages) => { if (!cancelled) setMessages(messages) })
      .catch(() => { if (!cancelled) toast.error('Failed to load inquiries') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadMessages])

  const refetchMessages = useCallback(() => {
    setLoading(true)
    loadMessages()
      .then(setMessages)
      .catch(() => toast.error('Failed to load inquiries'))
      .finally(() => setLoading(false))
  }, [loadMessages])

  const handleStatusChange = (id: string, status: string) => {
    api('/api/contact', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    })
      .then(() => {
        toast.success(`Inquiry marked ${status}`)
        refetchMessages()
        setViewMsg((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
      })
      .catch(() => toast.error('Failed to update inquiry'))
  }

  const filtered = messages.filter((m) => statusFilter === 'ALL' || m.status === statusFilter)
  const newCount = messages.filter((m) => m.status === 'NEW').length

  return (
    <div>
      <SectionHeader
        title="Inquiries"
        subtitle={`${messages.length} inquiry${messages.length === 1 ? '' : 's'} · ${newCount} new`}
        icon={<Inbox className="h-5 w-5" />}
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px] gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {INQUIRY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        showBookButton={false}
      />

      <div className="p-4 sm:p-6">
        <Card className="overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-foreground">No inquiries found</p>
              <p className="text-sm text-muted-foreground">Contact form submissions will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4 min-w-[180px]">Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} className="cursor-pointer" onClick={() => setViewMsg(m)}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        {m.status === 'NEW' && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{m.subject}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {m.phone || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${statusBadgeClass(m.status)}`}>{m.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation()
                          setViewMsg(m)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!viewMsg} onOpenChange={(o) => !o && setViewMsg(null)}>
        <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-serif text-xl">{viewMsg?.subject}</DialogTitle>
            <DialogDescription>
              Inquiry received on {viewMsg && formatDateTime(viewMsg.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {viewMsg && (
            <ScrollArea className="max-h-[calc(92vh-180px)]">
              <div className="space-y-4 p-6">
                {/* Sender info */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</p>
                      <p className="truncate text-sm font-medium text-foreground">{viewMsg.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
                      <p className="truncate text-sm font-medium text-foreground">{viewMsg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</p>
                      <p className="truncate text-sm font-medium text-foreground">{viewMsg.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Received</p>
                      <p className="truncate text-sm font-medium text-foreground">{formatDate(viewMsg.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Message body */}
                <Card className="bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{viewMsg.message}</p>
                </Card>

                {/* Status control */}
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Status</p>
                    <Badge className={`mt-1 text-[10px] ${statusBadgeClass(viewMsg.status)}`}>{viewMsg.status}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        Update Status <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {INQUIRY_STATUSES.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleStatusChange(viewMsg.id, s)}
                          disabled={s === viewMsg.status}
                        >
                          <span className={`mr-1.5 inline-flex h-2 w-2 rounded-full ${statusBadgeClass(s).split(' ')[0]}`} />
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
