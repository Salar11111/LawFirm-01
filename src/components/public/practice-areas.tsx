'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/lib/helpers'
import type { PracticeArea } from '@/lib/types'

const ICON_NAMES: Record<string, string> = {
  Users: 'Users',
  Building2: 'Building2',
  Gavel: 'Gavel',
  Home: 'Home',
  Landmark: 'Landmark',
  Scale: 'Scale',
  Receipt: 'Receipt',
  Shield: 'Shield',
}

export function PracticeAreas() {
  const router = useRouter()
  const { openBooking, selectedPracticeArea, setSelectedPracticeArea } = useAppStore()
  const [areas, setAreas] = useState<PracticeArea[]>([])
  const [loading, setLoading] = useState(true)
  const [localSelected, setLocalSelected] = useState<PracticeArea | null>(null)

  useEffect(() => {
    api<{ areas: PracticeArea[] }>('/api/practice-areas')
      .then(({ areas }) => setAreas(areas))
      .finally(() => setLoading(false))
  }, [])

  // Derived: store value takes priority, then local click selection
  const selected = selectedPracticeArea
    ? areas.find((a) => a.slug === selectedPracticeArea) || null
    : localSelected

  const closeDialog = () => {
    setLocalSelected(null)
    if (selectedPracticeArea) setSelectedPracticeArea(null)
  }

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[ICON_NAMES[iconName] || 'Scale']
    return Icon ? <Icon className="h-6 w-6" /> : <Icons.Scale className="h-6 w-6" />
  }

  return (
    <section id="practice-areas" className="relative py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Expertise</span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Practice Areas
          </h2>
          <p className="mt-4 text-muted-foreground">
            We offer comprehensive legal services across all major areas of Pakistani law, backed by
            decades of courtroom experience and a relentless commitment to our clients.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area, i) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card
                  onClick={() => setLocalSelected(area)}
                  className="group h-full cursor-pointer p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {renderIcon(area.icon)}
                  </div>
                  <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">{area.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{area.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/practice-areas">
              View All Practice Areas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {renderIcon(selected.icon)}
                </div>
                <DialogTitle className="font-serif text-2xl">{selected.title}</DialogTitle>
                <DialogDescription className="text-base">{selected.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-foreground/80">{selected.longDescription}</p>
                <div>
                  <h4 className="mb-3 font-semibold text-foreground">What we handle</h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {(() => {
                      try {
                        return JSON.parse(selected.features) as string[]
                      } catch {
                        return []
                      }
                    })().map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => { closeDialog(); openBooking() }} className="flex-1">
                    Book Consultation
                  </Button>
                  <Button variant="outline" onClick={() => { closeDialog(); router.push('/contact') }}>
                    Ask a Question
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

export function PracticeAreasPage() {
  const { setSelectedPracticeArea } = useAppStore()
  const [areas, setAreas] = useState<PracticeArea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ areas: PracticeArea[] }>('/api/practice-areas')
      .then(({ areas }) => setAreas(areas))
      .finally(() => setLoading(false))
  }, [])

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[ICON_NAMES[iconName] || 'Scale']
    return Icon ? <Icon className="h-7 w-7" /> : <Icons.Scale className="h-7 w-7" />
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Expertise</span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          Practice Areas
        </h1>
        <p className="mt-4 text-muted-foreground">
          From family disputes to corporate litigation, our experienced team provides expert legal
          representation across the full spectrum of Pakistani law.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {areas.map((area, i) => (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full p-6 transition-all hover:shadow-lg hover:border-primary/40">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {renderIcon(area.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-semibold text-foreground">{area.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{area.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(() => {
                        try { return JSON.parse(area.features) as string[] } catch { return [] }
                      })().slice(0, 4).map((f) => (
                        <span key={f} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{f}</span>
                      ))}
                    </div>
                    <Button
                      variant="link"
                      className="mt-3 h-auto p-0 text-primary"
                      onClick={() => setSelectedPracticeArea(area.slug)}
                    >
                      Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
