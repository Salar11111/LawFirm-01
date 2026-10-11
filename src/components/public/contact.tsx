'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/helpers'

const CONTACT_INFO = [
  { icon: MapPin, label: 'Office Address', value: 'Suite 1201, Business Avenue, I.I. Chundrigar Road, Karachi, Pakistan' },
  { icon: Phone, label: 'Phone', value: '+92 21 3537 9900', href: 'tel:+922135379900' },
  { icon: Mail, label: 'Email', value: 'info@shaheenlaw.pk', href: 'mailto:info@shaheenlaw.pk' },
  { icon: Clock, label: 'Office Hours', value: 'Monday – Saturday: 9:00 AM – 7:00 PM' },
]

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(form) })
      toast.success('Message sent! We will get back to you within 24 hours.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="bg-muted/30 py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Get In Touch</span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Contact Us
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have a legal question or need representation? Reach out — your first consultation is on us.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Contact info */}
          <div className="space-y-4 lg:col-span-2">
            {CONTACT_INFO.map((info) => (
              <Card key={info.label} className="flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <info.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="mt-0.5 block text-sm text-muted-foreground hover:text-primary">
                      {info.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">{info.value}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Form */}
          <Card className="p-6 lg:col-span-3 lg:p-8">
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-xl font-semibold text-foreground">Send us a message</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Full Name *</Label>
                  <Input id="c-name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Email *</Label>
                  <Input id="c-email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-phone">Phone</Label>
                  <Input id="c-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 3XX XXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-subject">Subject *</Label>
                  <Input id="c-subject" required value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="How can we help?" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-message">Message *</Label>
                <Textarea
                  id="c-message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="Describe your legal matter in detail..."
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Message
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Your information is kept strictly confidential.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Get In Touch</span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          Contact Us
        </h1>
        <p className="mt-4 text-muted-foreground">
          We&apos;re here to help. Reach out for a confidential consultation about your legal matter.
        </p>
      </div>
      <div className="mt-12">
        <Contact />
      </div>
    </div>
  )
}
