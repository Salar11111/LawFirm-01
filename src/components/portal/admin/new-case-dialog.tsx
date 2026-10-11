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
import { Loader2, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import {
  api,
  PRACTICE_AREAS_LIST,
  PAKISTANI_COURTS,
  CASE_STATUSES,
  PRIORITIES,
} from '@/lib/helpers'
import type { Case, User } from '@/lib/types'

interface NewCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  clients: User[]
  team: User[]
}

const emptyForm = {
  title: '',
  description: '',
  practiceArea: PRACTICE_AREAS_LIST[0],
  court: PAKISTANI_COURTS[0],
  status: 'PENDING',
  priority: 'MEDIUM',
  filedDate: new Date().toISOString().slice(0, 10),
  nextHearing: '',
  clientId: '',
  lawyerId: '',
}

export function NewCaseDialog({ open, onOpenChange, onCreated, clients, team }: NewCaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden p-0">
        {/* Form body remounts fresh each time the dialog opens (DialogContent unmounts on close) */}
        {open && (
          <CaseFormBody
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

function CaseFormBody({
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
    ...emptyForm,
    filedDate: new Date().toISOString().slice(0, 10),
    lawyerId: team[0]?.id ?? '',
    clientId: clients[0]?.id ?? '',
  }))
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a case title')
      return
    }
    if (!form.clientId) {
      toast.error('Please select a client')
      return
    }
    if (!form.lawyerId) {
      toast.error('Please assign a lawyer')
      return
    }
    setSubmitting(true)
    api<{ case: Case }>('/api/cases', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        nextHearing: form.nextHearing || null,
      }),
    })
      .then(() => {
        toast.success('Case created successfully')
        onCancel()
        onCreated()
      })
      .catch(() => toast.error('Failed to create case'))
      .finally(() => setSubmitting(false))
  }

  return (
    <>
      <DialogHeader className="border-b border-border px-6 py-4">
        <DialogTitle className="flex items-center gap-2 font-serif text-xl">
          <Briefcase className="h-5 w-5 text-primary" />
          Open New Case
        </DialogTitle>
        <DialogDescription>
          File a new legal matter. All fields marked are required.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[calc(92vh-180px)]">
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="c-title">Case Title *</Label>
            <Input
              id="c-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Contested divorce petition — Khan v. Khan"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief summary of the matter..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Practice Area</Label>
                <Select
                  value={form.practiceArea}
                  onValueChange={(v) => setForm((f) => ({ ...f, practiceArea: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRACTICE_AREAS_LIST.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Court</Label>
                <Select
                  value={form.court}
                  onValueChange={(v) => setForm((f) => ({ ...f, court: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {PAKISTANI_COURTS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CASE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-filed">Filed Date</Label>
                <Input
                  id="c-filed"
                  type="date"
                  value={form.filedDate}
                  onChange={(e) => setForm((f) => ({ ...f, filedDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-hearing">Next Hearing</Label>
                <Input
                  id="c-hearing"
                  type="date"
                  value={form.nextHearing}
                  onChange={(e) => setForm((f) => ({ ...f, nextHearing: e.target.value }))}
                />
              </div>
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
                <Label>Assigned Lawyer *</Label>
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
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
            Create Case
          </Button>
        </DialogFooter>
    </>
  )
}
