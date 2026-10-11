'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Linkedin, Mail, Phone, Calendar, Award, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { api, initials } from '@/lib/helpers'
import type { User } from '@/lib/types'

export function Team() {
  const { setView, openBooking } = useAppStore()
  const [team, setTeam] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ team: User[] }>('/api/team').then(({ team }) => setTeam(team)).finally(() => setLoading(false))
  }, [])

  return (
    <section id="team" className="bg-muted/30 py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our People</span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Meet Our Legal Team
          </h2>
          <p className="mt-4 text-muted-foreground">
            Experienced advocates and barristers dedicated to protecting your rights and achieving
            the best possible outcomes.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="group h-full overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-xl">
                  {/* Header banner */}
                  <div className="relative h-28 bg-gradient-to-br from-primary to-primary/70">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20" />
                    {member.role === 'ADMIN' && (
                      <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground">
                        Managing Partner
                      </Badge>
                    )}
                  </div>
                  <div className="px-5 pb-5">
                    <Avatar className="-mt-12 h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarFallback className="bg-primary/10 font-serif text-2xl font-bold text-primary">
                        {initials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">{member.specialization}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{member.bio}</p>

                    <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-accent" />
                        {member.experience}+ yrs
                      </span>
                      {member.barLicense && (
                        <span className="truncate" title={member.barLicense}>
                          Bar: {member.barLicense.split('/').pop()}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => openBooking(member.id)}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Book
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Email">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" onClick={() => setView('team')}>
            View Full Team
          </Button>
        </div>
      </div>
    </section>
  )
}

export function TeamPage() {
  const { openBooking } = useAppStore()
  const [team, setTeam] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ team: User[] }>('/api/team').then(({ team }) => setTeam(team)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our People</span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          Meet Our Legal Team
        </h1>
        <p className="mt-4 text-muted-foreground">
          Our advocates combine decades of courtroom experience with a genuine commitment to each client.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {team.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 shrink-0 bg-gradient-to-br from-primary to-primary/70 p-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-pattern-dots opacity-20" />
                  <Avatar className="relative h-24 w-24 border-4 border-primary-foreground/20">
                    <AvatarFallback className="bg-primary-foreground/10 font-serif text-2xl font-bold text-primary-foreground">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-foreground">{member.name}</h3>
                      <p className="text-sm font-medium text-primary">{member.specialization}</p>
                    </div>
                    {member.role === 'ADMIN' && (
                      <Badge className="bg-accent text-accent-foreground">Managing Partner</Badge>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Award className="h-3.5 w-3.5 text-accent" />
                      {member.experience}+ years experience
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      {member.phone}
                    </div>
                  </div>
                  {member.barLicense && (
                    <p className="mt-2 text-xs text-muted-foreground">Bar License: {member.barLicense}</p>
                  )}
                  <Button size="sm" className="mt-4 gap-1.5" onClick={() => openBooking(member.id)}>
                    <Calendar className="h-3.5 w-3.5" />
                    Book Consultation
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
