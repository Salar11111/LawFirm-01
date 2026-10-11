'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/helpers'
import type { User } from '@/lib/types'

export function LoginDialog() {
  const { loginOpen, setLoginOpen, setRegisterOpen, setUser, setView } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setEmail('')
    setPassword('')
    setShowPw(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await api<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setUser(user)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      setLoginOpen(false)
      reset()
      setView(user.role === 'CLIENT' ? 'client-portal' : 'admin-portal')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (type: 'admin' | 'lawyer' | 'client') => {
    const creds = {
      admin: { email: 'admin@shaheenlaw.pk', password: 'admin123' },
      lawyer: { email: 'sarah@shaheenlaw.pk', password: 'lawyer123' },
      client: { email: 'ahmed.client@email.com', password: 'client123' },
    }
    setEmail(creds[type].email)
    setPassword(creds[type].password)
  }

  return (
    <Dialog open={loginOpen} onOpenChange={(o) => { setLoginOpen(o); if (!o) reset() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Scale className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your portal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-pw">Password</Label>
            <div className="relative">
              <Input
                id="login-pw"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="rounded-lg bg-muted/60 p-3 text-center">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick demo access:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => fillDemo('admin')}>Admin</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => fillDemo('lawyer')}>Lawyer</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => fillDemo('client')}>Client</Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => { setLoginOpen(false); setRegisterOpen(true) }}
            className="font-medium text-primary hover:underline"
          >
            Register here
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
