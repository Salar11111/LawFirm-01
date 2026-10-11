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
  FileText,
  Plus,
  Filter,
  Inbox,
  Trash2,
  Upload,
  Loader2,
  File,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, formatDate, formatFileSize, statusBadgeClass, DOCUMENT_TYPES } from '@/lib/helpers'
import type { Case } from '@/lib/types'
import { SectionHeader } from './section-header'

interface DocRow {
  id: string
  title: string
  type: string
  fileName: string
  fileSize: number
  fileUrl: string
  description: string | null
  caseId: string | null
  uploadedBy: string
  createdAt: string
  uploader?: { id: string; name: string }
  case?: { id: string; caseNumber: string; title: string } | null
}

const TYPE_COLORS: Record<string, string> = {
  CONTRACT: 'bg-emerald-100 text-emerald-800',
  PETITION: 'bg-amber-100 text-amber-800',
  EVIDENCE: 'bg-orange-100 text-orange-800',
  COURT_FILING: 'bg-primary/15 text-primary',
  ID_PROOF: 'bg-zinc-100 text-zinc-700',
  AGREEMENT: 'bg-sky-100 text-sky-800',
  OTHER: 'bg-muted text-muted-foreground',
}

const emptyForm = {
  title: '',
  type: 'CONTRACT',
  fileName: '',
  description: '',
  caseId: '',
}

export function DocumentsSection() {
  const [docs, setDocs] = useState<DocRow[]>([])
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadDocs = useCallback(async () => {
    const { documents } = await api<{ documents: DocRow[] }>('/api/documents')
    return documents
  }, [])

  useEffect(() => {
    let cancelled = false
    loadDocs()
      .then((documents) => { if (!cancelled) setDocs(documents) })
      .catch(() => { if (!cancelled) toast.error('Failed to load documents') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadDocs])

  const refetchDocs = useCallback(() => {
    setLoading(true)
    loadDocs()
      .then(setDocs)
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false))
  }, [loadDocs])

  useEffect(() => {
    let cancelled = false
    api<{ cases: Case[] }>('/api/cases')
      .then(({ cases }) => { if (!cancelled) setCases(cases) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const filtered = docs.filter((d) => {
    if (typeFilter !== 'ALL' && d.type !== typeFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.case?.caseNumber.toLowerCase().includes(q) ||
        d.uploader?.name.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleUpload = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a document title')
      return
    }
    setSubmitting(true)
    api('/api/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title,
        type: form.type,
        fileName: form.fileName || form.title,
        fileSize: 0,
        fileUrl: `/documents/${form.fileName || form.title}`,
        description: form.description || null,
        caseId: form.caseId || null,
      }),
    })
      .then(() => {
        toast.success('Document uploaded')
        setUploadOpen(false)
        setForm(emptyForm)
        refetchDocs()
      })
      .catch(() => toast.error('Failed to upload document'))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = () => {
    if (!deleteId) return
    api(`/api/documents?id=${deleteId}`, { method: 'DELETE' })
      .then(() => {
        toast.success('Document deleted')
        setDeleteId(null)
        refetchDocs()
      })
      .catch(() => toast.error('Failed to delete document'))
  }

  return (
    <div>
      <SectionHeader
        title="Documents"
        subtitle={`${docs.length} document${docs.length === 1 ? '' : 's'} in the firm repository`}
        icon={<FileText className="h-5 w-5" />}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, file name, case..."
        actions={
          <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[150px] gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-2" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </>
        }
        showBookButton={false}
      />

      <div className="p-4 sm:p-6">
        <Card className="overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground">Upload a document or adjust filters.</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4 min-w-[220px]">Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Case</TableHead>
                  <TableHead className="hidden lg:table-cell">Uploaded By</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <File className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{d.fileName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${TYPE_COLORS[d.type] ?? TYPE_COLORS.OTHER}`}>
                        {d.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {d.case ? (
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-primary">{d.case.caseNumber}</span>
                          <span className="max-w-[180px] truncate text-xs text-muted-foreground">{d.case.title}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {d.uploader?.name ?? '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(d.createdAt)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {d.fileSize ? formatFileSize(d.fileSize) : '—'}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          aria-label="Delete"
                          onClick={() => setDeleteId(d.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-h-[92vh] max-w-lg overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="flex items-center gap-2 font-serif text-xl">
              <Upload className="h-5 w-5 text-primary" />
              Upload Document
            </DialogTitle>
            <DialogDescription>Add a new document to the firm repository.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(92vh-180px)]">
            <div className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label htmlFor="d-title">Document Title *</Label>
                <Input
                  id="d-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Sale deed — DHA Phase 6 plot"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d-fname">File Name</Label>
                  <Input
                    id="d-fname"
                    value={form.fileName}
                    onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.value }))}
                    placeholder="sale-deed.pdf"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Attach to Case</Label>
                <Select
                  value={form.caseId}
                  onValueChange={(v) => setForm((f) => ({ ...f, caseId: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="None — standalone document" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.caseNumber} — {c.title.slice(0, 30)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-desc">Description</Label>
                <Textarea
                  id="d-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional notes about this document..."
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the document from the repository. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
