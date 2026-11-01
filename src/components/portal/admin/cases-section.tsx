'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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
import { Briefcase, Plus, Eye, ChevronDown, Filter, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { api, formatDate, initials, statusBadgeClass, CASE_STATUSES } from '@/lib/helpers'
import type { Case, User } from '@/lib/types'
import { SectionHeader } from './section-header'
import { NewCaseDialog } from './new-case-dialog'
import { CaseDetailDialog } from './case-detail-dialog'

interface CasesSectionProps {
  user: User
  activeCaseId: string | null
  onActiveCaseChange: (id: string | null) => void
}

export function CasesSection({ user, activeCaseId, onActiveCaseChange }: CasesSectionProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [team, setTeam] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [newOpen, setNewOpen] = useState(false)

  const loadCases = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search.trim()) params.set('search', search.trim())
    const { cases } = await api<{ cases: Case[] }>(`/api/cases?${params.toString()}`)
    return cases
  }, [statusFilter, search])

  useEffect(() => {
    let cancelled = false
    loadCases()
      .then((cases) => { if (!cancelled) setCases(cases) })
      .catch(() => { if (!cancelled) toast.error('Failed to load cases') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadCases])

  const refetchCases = useCallback(() => {
    setLoading(true)
    loadCases()
      .then(setCases)
      .catch(() => toast.error('Failed to load cases'))
      .finally(() => setLoading(false))
  }, [loadCases])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<{ clients: User[] }>('/api/clients'),
      api<{ team: User[] }>('/api/team'),
    ])
      .then(([c, t]) => {
        if (cancelled) return
        setClients(c.clients)
        setTeam(t.team)
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load clients and lawyers') })
    return () => { cancelled = true }
  }, [])

  const sortedCases = useMemo(
    () =>
      [...cases].sort((a, b) => {
        const ah = a.nextHearing ? new Date(a.nextHearing).getTime() : Infinity
        const bh = b.nextHearing ? new Date(b.nextHearing).getTime() : Infinity
        return ah - bh
      }),
    [cases],
  )

  const isAdmin = user.role === 'ADMIN'

  return (
    <div>
      <SectionHeader
        title="Cases"
        subtitle={`${cases.length} matter${cases.length === 1 ? '' : 's'} on record`}
        icon={<Briefcase className="h-5 w-5" />}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, number, court..."
        actions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px] gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {CASE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-2" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Case</span>
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
          ) : sortedCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-foreground">No cases found</p>
              <p className="text-sm text-muted-foreground">Try adjusting filters or open a new case.</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4" />
                Open New Case
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Case #</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead className="hidden lg:table-cell">Lawyer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Priority</TableHead>
                  <TableHead className="hidden md:table-cell">Next Hearing</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCases.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => onActiveCaseChange(c.id)}
                  >
                    <TableCell className="pl-4 font-mono text-xs text-primary">{c.caseNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{c.title}</span>
                        <span className="text-xs text-muted-foreground">{c.practiceArea}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.client ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                              {initials(c.client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{c.client.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {c.lawyer?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${statusBadgeClass(c.status)}`}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={`text-[10px] ${statusBadgeClass(c.priority)}`}>{c.priority}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {c.nextHearing ? (
                        <span className={isUpcoming(c.nextHearing) ? 'font-semibold text-primary' : 'text-foreground'}>
                          {formatDate(c.nextHearing)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onActiveCaseChange(c.id)}>
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </DropdownMenuItem>
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

      <NewCaseDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={refetchCases}
        clients={clients}
        team={team}
      />
      <CaseDetailDialog
        caseId={activeCaseId}
        onClose={() => onActiveCaseChange(null)}
        onChanged={refetchCases}
        canDelete={isAdmin}
      />
    </div>
  )
}

function isUpcoming(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d >= now
}
