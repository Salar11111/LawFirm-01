'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/helpers'
import type { User } from '@/lib/types'
import { PAKISTANI_CITIES } from '@/lib/helpers'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function RegisterDialog() {
  const { registerOpen, setRegisterOpen, setLoginOpen, setUser, setView } = useAppStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
    city: '',
    address: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await api<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setUser(user)
      toast.success('Account created! Welcome to Shaheen Law Associates.')
      setRegisterOpen(false)
      setView('client-portal')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">Create Your Account</DialogTitle>
          <DialogDescription className="text-center">
            Register to access the client portal and track your cases
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-2">
            <Label htmlFor="r-name">Full Name *</Label>
            <Input id="r-name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ahmed Hassan" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="r-email">Email *</Label>
              <Input id="r-email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-phone">Phone</Label>
              <Input id="r-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+92 3XX XXXXXXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="r-cnic">CNIC</Label>
              <Input id="r-cnic" value={form.cnic} onChange={(e) => update('cnic', e.target.value)} placeholder="XXXXX-XXXXXXX-X" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-city">City</Label>
              <Select value={form.city} onValueChange={(v) => update('city', v)}>
                <SelectTrigger id="r-city"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {PAKISTANI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-address">Address</Label>
            <Input id="r-address" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="House, Street, Area" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-pw">Password *</Label>
            <div className="relative">
              <Input
                id="r-pw"
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Min. 6 characters"
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => { setRegisterOpen(false); setLoginOpen(true) }} className="font-medium text-primary hover:underline">
            Sign in
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
