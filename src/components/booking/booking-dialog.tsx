'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CalendarCheck } from 'lucide-react'
import { toast } from 'sonner'
import { api, APPOINTMENT_TYPES } from '@/lib/helpers'
import type { User, Appointment } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
]

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Initial Consultation',
  HEARING_PREP: 'Hearing Preparation',
  FOLLOW_UP: 'Follow-up Meeting',
  DOCUMENT_REVIEW: 'Document Review',
}

export function BookingDialog() {
  const { bookingOpen, setBookingOpen, bookingLawyerId, user, setLoginOpen, setRegisterOpen } = useAppStore()
  const [team, setTeam] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    lawyerId: '',
    date: '',
    time: '10:00',
    type: 'CONSULTATION',
    subject: '',
    notes: '',
  })

  useEffect(() => {
    if (bookingOpen) {
      api<{ team: User[] }>('/api/team').then(({ team }) => {
        setTeam(team)
        const initial = bookingLawyerId || team[0]?.id || ''
        setForm((p) => ({ ...p, lawyerId: initial }))
      }).catch(() => toast.error('Failed to load lawyers'))
      // default date = tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setForm((p) => ({ ...p, date: tomorrow.toISOString().split('T')[0] }))
    }
  }, [bookingOpen, bookingLawyerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setBookingOpen(false)
      toast.info('Please sign in or register to book an appointment')
      setRegisterOpen(true)
      return
    }
    setLoading(true)
    try {
      await api<{ appointment: Appointment }>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Appointment booked! Check your portal for details.')
      setBookingOpen(false)
      setForm({ lawyerId: team[0]?.id || '', date: '', time: '10:00', type: 'CONSULTATION', subject: '', notes: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">Book a Consultation</DialogTitle>
          <DialogDescription className="text-center">
            Schedule a meeting with one of our expert lawyers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-2">
            <Label htmlFor="b-lawyer">Select Lawyer *</Label>
            <Select value={form.lawyerId} onValueChange={(v) => setForm((p) => ({ ...p, lawyerId: v }))}>
              <SelectTrigger id="b-lawyer"><SelectValue placeholder="Choose a lawyer" /></SelectTrigger>
              <SelectContent>
                {team.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} — {t.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="b-subject">Subject *</Label>
            <Input
              id="b-subject"
              required
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Brief subject of your consultation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="b-date">Date *</Label>
              <Input
                id="b-date"
                type="date"
                required
                min={today}
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-time">Time *</Label>
              <Select value={form.time} onValueChange={(v) => setForm((p) => ({ ...p, time: v }))}>
                <SelectTrigger id="b-time"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="b-type">Consultation Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
              <SelectTrigger id="b-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="b-notes">Notes (optional)</Label>
            <Textarea
              id="b-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Briefly describe your legal matter..."
            />
          </div>

          {!user && (
            <p className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-200">
              You&apos;ll need to sign in or register to confirm your booking.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? 'Confirm Booking' : 'Continue to Register'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
