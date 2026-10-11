'use client'

import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Phone,
  MapPin,
  IdCard,
  Home,
  UserRound,
  CalendarDays,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { initials } from '@/lib/helpers'

export function ProfileSection() {
  const user = useAppStore((s) => s.user)

  if (!user) return null

  const infoItems = [
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phone || 'Not provided' },
    { icon: IdCard, label: 'CNIC', value: user.cnic ? formatCnic(user.cnic) : 'Not provided' },
    { icon: MapPin, label: 'City', value: user.city || 'Not provided' },
    { icon: Home, label: 'Address', value: user.address || 'Not provided' },
  ]

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="relative h-24 bg-gradient-to-r from-primary to-primary/70">
          <div className="absolute inset-0 bg-pattern-dots opacity-20" aria-hidden />
        </div>
        <CardContent className="relative p-5 pt-0">
          <div className="-mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-20 w-20 border-4 border-card bg-primary shadow-md">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="bg-primary font-serif text-2xl font-bold text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-1">
              <h2 className="font-serif text-xl font-bold text-foreground">{user.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="gap-1 bg-primary text-primary-foreground">
                  <UserRound className="h-3 w-3" /> Client
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <ShieldCheck className="h-3 w-3" /> Verified Account
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <UserRound className="h-4 w-4 text-accent" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {infoItems.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={item.label}>
                    {idx > 0 && <Separator className="my-3 bg-border sm:hidden" />}
                    <div className="flex items-start gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                        <dd className="mt-0.5 break-words text-sm font-medium text-foreground">{item.value}</dd>
                      </div>
                    </div>
                    {idx < infoItems.length - 1 && <Separator className="hidden bg-border sm:block" />}
                  </div>
                )
              })}
            </dl>
          </CardContent>
        </Card>

        {/* Side cards */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-base">
                <Scale className="h-4 w-4 text-accent" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Account</span>
                <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" /> Active
                </Badge>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Role</span>
                <span className="text-xs font-semibold text-foreground">Client</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" /> Member since
                </span>
                <span className="text-xs font-semibold text-foreground">Shaheen Law Associates</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-5">
              <Scale className="h-7 w-7 text-accent" />
              <p className="mt-3 font-serif text-base font-semibold">Need to update your info?</p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                Contact our office to update your personal details, CNIC, or contact information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatCnic(cnic: string): string {
  // Format Pakistani CNIC: XXXXX-XXXXXXX-X
  const digits = cnic.replace(/\D/g, '')
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
  }
  return cnic
}
