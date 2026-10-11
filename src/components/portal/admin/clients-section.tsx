'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Eye, Mail, Phone, MapPin, Inbox, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { api, formatDate, initials, statusBadgeClass } from '@/lib/helpers'
import type { Case, User } from '@/lib/types'
import { SectionHeader } from './section-header'

interface ClientRow {
  id: string
  name: string
  email: string
  phone: string | null
  cnic: string | null
  city: string | null
  address: string | null
  createdAt: string
  active: boolean
  _count: { clientCases: number }
}

interface ClientsSectionProps {
  user: User
  onOpenCase: (caseId: string) => void
}

export function ClientsSection({ user, onOpenCase }: ClientsSectionProps) {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewClient, setViewClient] = useState<ClientRow | null>(null)
  const [clientCases, setClientCases] = useState<Case[]>([])
  const [clientCasesForId, setClientCasesForId] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    const { clients } = await api<{ clients: ClientRow[] }>(`/api/clients?${params.toString()}`)
    return clients
  }, [search])

  useEffect(() => {
    let cancelled = false
    loadClients()
      .then((clients) => { if (!cancelled) setClients(clients) })
      .catch(() => { if (!cancelled) toast.error('Failed to load clients') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadClients])

  const refetchClients = useCallback(() => {
    setLoading(true)
    loadClients()
      .then(setClients)
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false))
  }, [loadClients])

  // Load cases when a client is opened — setState only in async callbacks
  const viewClientId = viewClient?.id ?? null
  const casesLoading = !!viewClientId && clientCasesForId !== viewClientId
  useEffect(() => {
    if (!viewClientId) return
    let cancelled = false
    api<{ cases: Case[] }>('/api/cases')
      .then(({ cases }) => {
        if (cancelled) return
        setClientCases(cases.filter((c) => c.clientId === viewClientId))
        setClientCasesForId(viewClientId)
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load client cases') })
    return () => { cancelled = true }
  }, [viewClientId])

  const handleToggleActive = (client: ClientRow) => {
    setToggling(client.id)
    api('/api/clients', {
      method: 'PATCH',
      body: JSON.stringify({ id: client.id, active: !client.active }),
    })
      .then(() => {
        toast.success(`${client.name} ${client.active ? 'deactivated' : 'activated'}`)
        refetchClients()
      })
      .catch(() => toast.error('Failed to update client'))
      .finally(() => setToggling(null))
  }

  const isAdmin = user.role === 'ADMIN'
  const activeCount = useMemo(() => clients.filter((c) => c.active).length, [clients])

  return (
    <div>
      <SectionHeader
        title="Clients"
        subtitle={`${clients.length} registered · ${activeCount} active`}
        icon={<Users className="h-5 w-5" />}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search clients by name, email, phone..."
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
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-foreground">No clients found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Client</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">City</TableHead>
                  <TableHead className="text-center">Cases</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.phone ?? '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {c.city ?? '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-semibold">{c._count.clientCases}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={c.active}
                            onCheckedChange={() => handleToggleActive(c)}
                            disabled={toggling === c.id}
                            aria-label={`Toggle active for ${c.name}`}
                          />
                          <span className={`text-xs font-medium ${c.active ? 'text-primary' : 'text-muted-foreground'}`}>
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ) : (
                        <Badge className={c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}>
                          {c.active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => setViewClient(c)}
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

      {/* Client detail dialog */}
      <Dialog open={!!viewClient} onOpenChange={(o) => !o && setViewClient(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-serif text-xl">Client Profile</DialogTitle>
            <DialogDescription>Client details and associated cases</DialogDescription>
          </DialogHeader>

          {viewClient && (
            <ScrollArea className="max-h-[calc(92vh-130px)]">
              <div className="space-y-5 p-6">
                {/* Profile header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border">
                    <AvatarFallback className="bg-primary/10 font-serif text-xl font-bold text-primary">
                      {initials(viewClient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl font-bold text-foreground">{viewClient.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge className={viewClient.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}>
                        {viewClient.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {viewClient._count.clientCases} case{viewClient._count.clientCases === 1 ? '' : 's'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow icon={Mail} label="Email" value={viewClient.email} />
                  <InfoRow icon={Phone} label="Phone" value={viewClient.phone ?? '—'} />
                  <InfoRow icon={MapPin} label="City" value={viewClient.city ?? '—'} />
                  <InfoRow icon={Users} label="CNIC" value={viewClient.cnic ?? '—'} />
                </div>

                {viewClient.address && (
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</p>
                    <p className="mt-1 text-sm text-foreground">{viewClient.address}</p>
                  </Card>
                )}

                {/* Cases */}
                <div>
                  <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    Associated Cases
                  </h4>
                  {casesLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : clientCases.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                      No cases associated with this client.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {clientCases.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setViewClient(null)
                            onOpenCase(c.id)
                          }}
                          className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.caseNumber} · {c.court}
                            </p>
                          </div>
                          <Badge className={`text-[10px] ${statusBadgeClass(c.status)}`}>{c.status}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
