'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Scale, Mail, Phone, Award, GraduationCap, MapPin, Calendar } from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { api, initials } from '@/lib/helpers'
import type { User } from '@/lib/types'
import { SectionHeader } from './section-header'

export function TeamSection() {
  const openBooking = useAppStore((s) => s.openBooking)
  const [team, setTeam] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ team: User[] }>('/api/team')
      .then(({ team }) => setTeam(team))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <SectionHeader
        title="Legal Team"
        subtitle={`${team.length} advocate${team.length === 1 ? '' : 's'} and partners`}
        icon={<Scale className="h-5 w-5" />}
      />

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <Card key={m.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                {/* Banner */}
                <div className="relative h-24 bg-gradient-to-br from-primary to-primary/70">
                  <div className="absolute inset-0 bg-pattern-dots opacity-20" />
                  {m.role === 'ADMIN' && (
                    <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground">
                      Managing Partner
                    </Badge>
                  )}
                </div>
                <div className="px-5 pb-5">
                  <Avatar className="-mt-10 h-20 w-20 border-4 border-background shadow-md">
                    <AvatarFallback className="bg-primary/10 font-serif text-xl font-bold text-primary">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">{m.name}</h3>
                  <p className="text-sm font-medium text-primary">{m.specialization}</p>
                  {m.bio && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.bio}</p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-accent" />
                      {m.experience ?? 0}+ yrs
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-accent" />
                      <span className="truncate" title={m.barLicense ?? ''}>
                        {m.barLicense ? m.barLicense.split('/').pop() : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-accent" />
                      <span className="truncate">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      <span className="truncate">{m.phone ?? '—'}</span>
                    </div>
                  </div>

                  {m.city && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {m.city}
                    </p>
                  )}

                  <Button
                    size="sm"
                    className="mt-4 w-full gap-1.5"
                    onClick={() => openBooking(m.id)}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Book Consultation
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
