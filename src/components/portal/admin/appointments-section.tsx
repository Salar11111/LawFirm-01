'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  CalendarDays,
  Plus,
  ChevronDown,
  Filter,
  Inbox,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  api,
  formatDate,
  initials,
  statusBadgeClass,
  APPOINTMENT_STATUSES,
} from '@/lib/helpers'
import type { Appointment, User } from '@/lib/types'
import { SectionHeader } from './section-header'
import { NewAppointmentDialog } from './new-appointment-dialog'

const TYPE_ICON: Record<string, typeof Clock> = {
  CONSULTATION: CalendarIcon,
  HEARING_PREP: FileText,
  FOLLOW_UP: Clock,
  DOCUMENT_REVIEW: Video,
}

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consultation',
  HEARING_PREP: 'Hearing Prep',
  FOLLOW_UP: 'Follow-up',
  DOCUMENT_REVIEW: 'Doc Review',
}

export function AppointmentsSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [team, setTeam] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [newOpen, setNewOpen] = useState(false)

  const loadAppointments = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    const { appointments } = await api<{ appointments: Appointment[] }>(`/api/appointments?${params.toString()}`)
    return appointments
  }, [statusFilter])

  useEffect(() => {
    let cancelled = false
    loadAppointments()
      .then((appointments) => { if (!cancelled) setAppointments(appointments) })
      .catch(() => { if (!cancelled) toast.error('Failed to load appointments') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadAppointments])

  const refetchAppointments = useCallback(() => {
    setLoading(true)
    loadAppointments()
      .then(setAppointments)
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [loadAppointments])

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

  const handleStatusChange = (id: string, status: string) => {
    api('/api/appointments', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    })
      .then(() => {
        toast.success(`Appointment marked ${status}`)
        refetchAppointments()
      })
      .catch(() => toast.error('Failed to update appointment'))
  }

  const sorted = [...appointments].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime(),
  )

  return (
    <div>
      <SectionHeader
        title="Appointments"
        subtitle={`${appointments.length} scheduled appointment${appointments.length === 1 ? '' : 's'}`}
        icon={<CalendarDays className="h-5 w-5" />}
        actions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[150px] gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {APPOINTMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-2" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Appointment</span>
            </Button>
          </>
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
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-foreground">No appointments</p>
              <p className="text-sm text-muted-foreground">Schedule a new appointment to get started.</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => setNewOpen(true)}>
                <Plus className="h-4 w-4" />
                New Appointment
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4 min-w-[200px]">Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead className="hidden lg:table-cell">Lawyer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((a) => {
                  const TypeIcon = TYPE_ICON[a.type] ?? CalendarIcon
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <TypeIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{a.subject}</p>
                            <p className="text-xs text-muted-foreground">
                              {a.duration} min · {TYPE_LABELS[a.type] ?? a.type}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {a.client ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                {initials(a.client.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">{a.client.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {a.lawyer?.name ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{formatDate(a.date)}</p>
                          <p className="text-xs text-muted-foreground">{a.time}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {TYPE_LABELS[a.type] ?? a.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${statusBadgeClass(a.status)}`}>{a.status}</Badge>
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
                            <DropdownMenuItem onClick={() => handleStatusChange(a.id, 'SCHEDULED')}>
                              <CalendarIcon className="h-3.5 w-3.5" /> Scheduled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(a.id, 'COMPLETED')}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(a.id, 'CANCELLED')}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancelled
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <NewAppointmentDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={refetchAppointments}
        clients={clients}
        team={team}
      />
    </div>
  )
}
