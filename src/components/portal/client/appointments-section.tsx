'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { api, formatDate, statusBadgeClass, initials } from '@/lib/helpers'
import type { Appointment, User } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  CalendarDays,
  Clock,
  CalendarPlus,
  UserRound,
  CalendarCheck,
  CalendarX,
  StickyNote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS } from './labels'
import { LoadError } from '@/components/portal/load-error'

export function AppointmentsSection() {
  const openBooking = useAppStore((s) => s.openBooking)

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    api<{ appointments: Appointment[] }>('/api/appointments')
      .then(({ appointments: a }) => {
        if (!cancelled) setAppointments(a ?? [])
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

  const now = new Date()
  const upcoming = appointments
    .filter((a) => new Date(a.date) >= now && a.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const past = appointments
    .filter((a) => new Date(a.date) < now || a.status !== 'SCHEDULED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (loadError) {
    return (
      <LoadError
        title="Appointments could not be loaded"
        onRetry={() => setAttempt((n) => n + 1)}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading…' : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} total · ${upcoming.length} upcoming`}
        </p>
        <Button onClick={() => openBooking()} className="gap-2 self-start sm:self-auto">
          <CalendarPlus className="h-4 w-4" /> Book Consultation
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="upcoming" className="gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-1.5">
            <CalendarX className="h-3.5 w-3.5" />
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {loading ? (
            <SkeletonGrid />
          ) : upcoming.length === 0 ? (
            <EmptyAppointments onBook={() => openBooking()} />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {upcoming.map((a) => <AppointmentCard key={a.id} a={a} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {loading ? (
            <SkeletonGrid />
          ) : past.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CalendarX className="h-6 w-6" />
                </span>
                <p className="mt-3 font-serif text-base font-semibold text-foreground">No past appointments</p>
                <p className="mt-1 text-sm text-muted-foreground">Your appointment history will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {past.map((a) => <AppointmentCard key={a.id} a={a} muted />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AppointmentCard({ a, muted = false }: { a: Appointment; muted?: boolean }) {
  const lawyer = a.lawyer as User | undefined
  const date = new Date(a.date)
  const day = date.getDate()
  const month = formatDate(a.date, { month: 'short' }).split(' ')[0]

  return (
    <Card className={cn('gap-0 overflow-hidden', muted && 'opacity-90')}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Date block */}
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
            <span className="text-[10px] font-semibold uppercase tracking-wide">{month}</span>
            <span className="font-serif text-2xl font-bold leading-none">{day}</span>
            <span className="mt-0.5 text-[9px] text-primary/70">{date.getFullYear()}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-base font-semibold leading-snug text-foreground">{a.subject}</h3>
              <Badge className={cn('shrink-0 border-transparent text-[10px]', statusBadgeClass(a.status))}>
                {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
              </Badge>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {a.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-accent" />
                {a.duration} min
              </span>
              <Badge variant="outline" className="border-border px-1.5 py-0 text-[9px] uppercase text-muted-foreground">
                {APPOINTMENT_TYPE_LABELS[a.type] ?? a.type}
              </Badge>
            </div>

            <Separator className="my-3 bg-border" />

            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-border">
                {lawyer?.avatar ? <AvatarImage src={lawyer.avatar} alt={lawyer.name} /> : null}
                <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                  {lawyer ? initials(lawyer.name) : 'SL'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-xs font-semibold text-foreground">
                  <UserRound className="h-3 w-3 text-muted-foreground" />
                  {lawyer?.name ?? 'Lawyer'}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">{lawyer?.specialization ?? 'Legal Counsel'}</p>
              </div>
            </div>

            {a.notes && (
              <div className="mt-3 flex gap-2 rounded-lg bg-muted/50 p-2.5">
                <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">{a.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="gap-0">
          <CardContent className="space-y-3 p-5">
            <div className="flex gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyAppointments({ onBook }: { onBook: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarCheck className="h-7 w-7" />
        </span>
        <p className="mt-4 font-serif text-lg font-semibold text-foreground">No upcoming appointments</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Schedule a consultation with one of our expert lawyers to discuss your legal matter.
        </p>
        <Button onClick={onBook} className="mt-5 gap-2">
          <CalendarPlus className="h-4 w-4" /> Book a Consultation
        </Button>
      </CardContent>
    </Card>
  )
}
