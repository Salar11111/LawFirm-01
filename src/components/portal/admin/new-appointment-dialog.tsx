'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { api, APPOINTMENT_TYPES } from '@/lib/helpers'
import type { Appointment, User } from '@/lib/types'

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

interface NewAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  clients: User[]
  team: User[]
}

export function NewAppointmentDialog({
  open,
  onOpenChange,
  onCreated,
  clients,
  team,
}: NewAppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden p-0">
        {open && (
          <AppointmentFormBody
            clients={clients}
            team={team}
            onCancel={() => onOpenChange(false)}
            onCreated={onCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function AppointmentFormBody({
  clients,
  team,
  onCancel,
  onCreated,
}: {
  clients: User[]
  team: User[]
  onCancel: () => void
  onCreated: () => void
}) {
  const [form, setForm] = useState(() => ({
    subject: '',
    lawyerId: team[0]?.id ?? '',
    clientId: clients[0]?.id ?? '',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    duration: '30',
    type: 'CONSULTATION',
    notes: '',
  }))
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!form.subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!form.clientId) {
      toast.error('Please select a client')
      return
    }
    if (!form.lawyerId) {
      toast.error('Please select a lawyer')
      return
    }
    setSubmitting(true)
    api<{ appointment: Appointment }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        subject: form.subject,
        lawyerId: form.lawyerId,
        clientId: form.clientId,
        date: form.date,
        time: form.time,
        duration: Number(form.duration),
        type: form.type,
        notes: form.notes || null,
      }),
    })
      .then(() => {
        toast.success('Appointment scheduled')
        onCancel()
        onCreated()
      })
      .catch(() => toast.error('Failed to schedule appointment'))
      .finally(() => setSubmitting(false))
  }

  return (
    <>
      <DialogHeader className="border-b border-border px-6 py-4">
        <DialogTitle className="flex items-center gap-2 font-serif text-xl">
          <CalendarPlus className="h-5 w-5 text-primary" />
          Schedule Appointment
        </DialogTitle>
        <DialogDescription>Book a new appointment with a client.</DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(92vh-180px)]">
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="a-subject">Subject *</Label>
            <Input
              id="a-subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Initial consultation — property dispute"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Client *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}
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
              <Label>Lawyer *</Label>
              <Select
                value={form.lawyerId}
                onValueChange={(v) => setForm((f) => ({ ...f, lawyerId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select lawyer" /></SelectTrigger>
                <SelectContent>
                  {team.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-date">Date *</Label>
              <Input
                id="a-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Select
                value={form.time}
                onValueChange={(v) => setForm((f) => ({ ...f, time: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (minutes)</Label>
              <Select
                value={form.duration}
                onValueChange={(v) => setForm((f) => ({ ...f, duration: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="a-notes">Notes</Label>
            <Textarea
              id="a-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional agenda or preparation notes..."
              rows={2}
            />
          </div>
        </div>
      </ScrollArea>

      <DialogFooter className="border-t border-border px-6 py-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
          Schedule
        </Button>
      </DialogFooter>
    </>
  )
}
