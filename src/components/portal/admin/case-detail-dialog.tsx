'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Scale,
  User as UserIcon,
  Gavel,
  Calendar,
  FileText,
  Receipt,
  Plus,
  ChevronDown,
  Trash2,
  Clock,
  MapPin,
  Tag,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  api,
  formatDate,
  formatPKR,
  initials,
  statusBadgeClass,
  CASE_STATUSES,
  PRIORITIES,
} from '@/lib/helpers'
import type { Case, CaseUpdate, DocumentItem, Invoice, User } from '@/lib/types'

const UPDATE_TYPES = [
  'FILING',
  'HEARING',
  'EVIDENCE',
  'MOTION',
  'JUDGMENT',
  'NOTE',
] as const

const UPDATE_TYPE_LABELS: Record<string, string> = {
  FILING: 'Filing',
  HEARING: 'Hearing',
  EVIDENCE: 'Evidence',
  MOTION: 'Motion',
  JUDGMENT: 'Judgment',
  NOTE: 'Note',
}

interface CaseDetailDialogProps {
  caseId: string | null
  onClose: () => void
  onChanged: () => void
  canDelete?: boolean
}

export function CaseDetailDialog({ caseId, onClose, onChanged, canDelete }: CaseDetailDialogProps) {
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({ title: '', description: '', updateType: 'NOTE' })

  // Derived loading state: true while we have a caseId but the matching data hasn't loaded yet
  const loading = !!caseId && caseData?.id !== caseId

  const loadCase = useCallback(async (id: string) => {
    const { case: c } = await api<{ case: Case }>(`/api/cases/${id}`)
    return c
  }, [])

  useEffect(() => {
    if (!caseId) return
    let cancelled = false
    loadCase(caseId)
      .then((c) => {
        if (cancelled) return
        setCaseData(c)
        setUpdateForm({ title: '', description: '', updateType: 'NOTE' })
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load case') })
    return () => { cancelled = true }
  }, [caseId, loadCase])

  const refetchCase = useCallback(() => {
    if (!caseId) return
    loadCase(caseId)
      .then(setCaseData)
      .catch(() => toast.error('Failed to load case'))
  }, [caseId, loadCase])

  const handleStatusChange = (field: 'status' | 'priority', value: string) => {
    if (!caseData) return
    api('/api/cases', {
      method: 'PATCH',
      body: JSON.stringify({ id: caseData.id, [field]: value }),
    })
      .then(() => {
        toast.success(`${field} updated`)
        refetchCase()
        onChanged()
      })
      .catch(() => toast.error('Failed to update case'))
  }

  const handleAddUpdate = () => {
    if (!caseData || !updateForm.title.trim()) {
      toast.error('Please enter a title for the update')
      return
    }
    setSubmitting(true)
    api(`/api/cases/${caseData.id}/updates`, {
      method: 'POST',
      body: JSON.stringify(updateForm),
    })
      .then(() => {
        toast.success('Update added to timeline')
        setUpdateForm({ title: '', description: '', updateType: 'NOTE' })
        refetchCase()
        onChanged()
      })
      .catch(() => toast.error('Failed to add update'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = () => {
    if (!caseData) return
    api(`/api/cases/${caseData.id}`, { method: 'DELETE' })
      .then(() => {
        toast.success('Case deleted')
        setDeleteOpen(false)
        onClose()
        onChanged()
      })
      .catch(() => toast.error('Failed to delete case'))
  }

  const documents = (caseData?.documents ?? []) as DocumentItem[]
  const updates = (caseData?.updates ?? []) as CaseUpdate[]
  const invoices = (caseData?.invoices ?? []) as Invoice[]

  return (
    <>
      <Dialog open={!!caseId} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div className="min-w-0">
                <DialogTitle className="font-serif text-xl text-foreground">
                  {loading ? <Skeleton className="h-6 w-64" /> : caseData?.title}
                </DialogTitle>
                <DialogDescription className="mt-0.5 flex items-center gap-2 text-xs">
                  {caseData && (
                    <>
                      <span className="font-mono text-primary">{caseData.caseNumber}</span>
                      <span>·</span>
                      <span>{caseData.practiceArea}</span>
                    </>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {caseData && (
                  <>
                    <StatusDropdown
                      label="Status"
                      value={caseData.status}
                      options={CASE_STATUSES}
                      onChange={(v) => handleStatusChange('status', v)}
                    />
                    <StatusDropdown
                      label="Priority"
                      value={caseData.priority}
                      options={PRIORITIES}
                      onChange={(v) => handleStatusChange('priority', v)}
                    />
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : caseData ? (
            <ScrollArea className="max-h-[calc(92vh-90px)]">
              <div className="grid gap-5 p-6 lg:grid-cols-3">
                {/* Left column — case info */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile icon={Scale} label="Court" value={caseData.court} />
                    <InfoTile
                      icon={Calendar}
                      label="Filed Date"
                      value={formatDate(caseData.filedDate)}
                    />
                    <InfoTile
                      icon={Clock}
                      label="Next Hearing"
                      value={formatDate(caseData.nextHearing)}
                      highlight={!!caseData.nextHearing}
                    />
                    <InfoTile
                      icon={Gavel}
                      label="Closed Date"
                      value={formatDate(caseData.closedDate)}
                    />
                  </div>

                  <Card className="p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {caseData.description || 'No description provided.'}
                    </p>
                  </Card>

                  {/* Timeline */}
                  <Card className="p-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Case Timeline
                    </h4>
                    {updates.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No updates recorded yet.
                      </p>
                    ) : (
                      <ol className="relative space-y-4 border-l border-border pl-5">
                        {updates
                          .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((u) => (
                            <li key={u.id} className="relative">
                              <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary" />
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  {UPDATE_TYPE_LABELS[u.updateType] ?? u.updateType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(u.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-semibold text-foreground">{u.title}</p>
                              {u.description && (
                                <p className="mt-0.5 text-sm text-muted-foreground">{u.description}</p>
                              )}
                            </li>
                          ))}
                      </ol>
                    )}
                  </Card>

                  {/* Add update form */}
                  <Card className="border-primary/20 bg-primary/5 p-4">
                    <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Plus className="h-4 w-4 text-primary" />
                      Add Timeline Update
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="upd-title" className="text-xs">Title</Label>
                        <Input
                          id="upd-title"
                          value={updateForm.title}
                          onChange={(e) => setUpdateForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. Filed response to opposing counsel"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Update Type</Label>
                        <Select
                          value={updateForm.updateType}
                          onValueChange={(v) => setUpdateForm((f) => ({ ...f, updateType: v }))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UPDATE_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {UPDATE_TYPE_LABELS[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <Label htmlFor="upd-desc" className="text-xs">Description</Label>
                      <Textarea
                        id="upd-desc"
                        value={updateForm.description}
                        onChange={(e) => setUpdateForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Additional details about this update..."
                        rows={2}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={handleAddUpdate}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Add Update
                    </Button>
                  </Card>

                  {/* Documents */}
                  <Card className="p-4">
                    <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Documents ({documents.length})
                    </h4>
                    {documents.length === 0 ? (
                      <p className="py-3 text-center text-sm text-muted-foreground">No documents attached.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {documents.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {d.fileName} · {formatDate(d.createdAt)}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Invoices */}
                  <Card className="p-4">
                    <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Receipt className="h-3.5 w-3.5" />
                      Invoices ({invoices.length})
                    </h4>
                    {invoices.length === 0 ? (
                      <p className="py-3 text-center text-sm text-muted-foreground">No invoices for this case.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {inv.invoiceNumber}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                Due {formatDate(inv.dueDate)}
                              </p>
                            </div>
                            <span className="font-serif text-sm font-bold text-foreground">
                              {formatPKR(inv.amount)}
                            </span>
                            <Badge className={`text-[10px] ${statusBadgeClass(inv.status)}`}>{inv.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Right column — people */}
                <div className="space-y-4">
                  <PersonCard title="Client" person={caseData.client} />
                  <PersonCard title="Assigned Lawyer" person={caseData.lawyer} />
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this case?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{caseData?.title}</strong> ({caseData?.caseNumber}) and all related updates and documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function StatusDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Badge className={`text-[10px] ${statusBadgeClass(value)}`}>{value}</Badge>
          <span className="text-xs text-muted-foreground">{label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Change {label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)}>
            <span className={`mr-2 inline-flex h-2 w-2 rounded-full ${statusBadgeClass(o).split(' ')[0]}`} />
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Calendar
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}

function PersonCard({ title, person }: { title: string; person?: User }) {
  return (
    <Card className="p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {person ? (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarFallback className="bg-primary/10 font-serif text-sm font-bold text-primary">
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{person.name}</p>
            <p className="truncate text-xs text-muted-foreground">{person.email}</p>
            {person.phone && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {person.city ?? '—'}
              </p>
            )}
            {person.specialization && (
              <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                <Tag className="h-3 w-3" />
                {person.specialization}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not assigned</p>
      )}
    </Card>
  )
}
