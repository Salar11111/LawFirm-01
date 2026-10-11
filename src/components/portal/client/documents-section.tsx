'use client'

import { useEffect, useState } from 'react'
import { api, formatDate, formatFileSize, initials } from '@/lib/helpers'
import type { DocumentItem, User } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  FileText,
  Search,
  Download,
  FileStack,
  Inbox,
  FileSignature,
  FileCheck2,
  ScrollText,
  FolderArchive,
  IdCard,
  File,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DOCUMENT_TYPE_LABELS } from './labels'
import { DOCUMENT_TYPES } from '@/lib/helpers'

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CONTRACT: FileSignature,
  PETITION: ScrollText,
  EVIDENCE: FolderArchive,
  COURT_FILING: FileCheck2,
  ID_PROOF: IdCard,
  AGREEMENT: FileSignature,
  OTHER: File,
}

export function DocumentsSection() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  useEffect(() => {
    let cancelled = false
    api<{ documents: DocumentItem[] }>('/api/documents')
      .then(({ documents: d }) => {
        if (!cancelled) setDocuments(d ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = documents.filter((d) => {
    if (typeFilter !== 'ALL' && d.type !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        (d.case?.caseNumber ?? '').toLowerCase().includes(q) ||
        (d.uploader?.name ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalSize = documents.reduce((sum, d) => sum + (d.fileSize ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* Summary + toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileStack className="h-4 w-4 text-accent" />
          {loading ? 'Loading…' : `${documents.length} document${documents.length !== 1 ? 's' : ''} · ${formatFileSize(totalSize)} total`}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:w-64"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="sm:w-44"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{DOCUMENT_TYPE_LABELS[t] ?? t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table for desktop, cards for mobile */}
      {loading ? (
        <Card className="gap-0">
          <CardContent className="space-y-3 pt-6">
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="h-7 w-7" />
            </span>
            <p className="mt-4 font-serif text-lg font-semibold text-foreground">
              {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {documents.length === 0
                ? 'Documents shared by your legal team on your cases will appear here.'
                : 'Try a different search or filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden gap-0 overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-5">Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Uploaded by</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => {
                  const Icon = TYPE_ICONS[d.type] ?? FileText
                  return (
                    <TableRow key={d.id} className="group">
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{d.title}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{d.fileName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border text-[10px] uppercase text-muted-foreground">
                          {DOCUMENT_TYPE_LABELS[d.type] ?? d.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {d.case ? (
                          <span className="font-mono text-[11px] text-muted-foreground">{d.case.caseNumber}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.uploader?.name ?? 'Staff'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{formatFileSize(d.fileSize)}</TableCell>
                      <TableCell className="pr-5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary opacity-70 group-hover:opacity-100"
                          aria-label={`Download ${d.title}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((d) => {
              const Icon = TYPE_ICONS[d.type] ?? FileText
              return (
                <Card key={d.id} className="gap-0">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{d.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{d.fileName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="border-border px-1.5 py-0 text-[9px] uppercase">
                            {DOCUMENT_TYPE_LABELS[d.type] ?? d.type}
                          </Badge>
                          {d.case && <span className="font-mono">{d.case.caseNumber}</span>}
                          <span>{formatFileSize(d.fileSize)}</span>
                          <span>{formatDate(d.createdAt)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-primary" aria-label={`Download ${d.title}`}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
