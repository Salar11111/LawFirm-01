'use client'

import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const PROOF = [
  { label: 'Chambers', value: 'Karachi, Lahore, Islamabad' },
  { label: 'Practice', value: 'Since 1998' },
  { label: 'Courts', value: 'All courts of Pakistan' },
]

export function Hero() {
  const { openBooking, setLoginOpen, user } = useAppStore()
  const portalHref = user?.role === 'CLIENT' ? '/portal' : '/dashboard'

  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Shaheen Law Associates
            </p>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Justice, delivered with honour
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Counsel for families, companies, and individuals across family, corporate, criminal,
              property, and constitutional matters.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => openBooking()} className="gap-2">
                Book a Consultation
                <ArrowRight className="h-4 w-4" />
              </Button>
              {!user ? (
                <Button size="lg" variant="outline" onClick={() => setLoginOpen(true)}>
                  Client Portal Login
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild>
                  <Link href={portalHref}>Go to My Portal</Link>
                </Button>
              )}
            </div>
          </div>

          <aside className="border-l-2 border-accent bg-card">
            <ul>
              {PROOF.map((item) => (
                <li key={item.label} className="border-b border-border px-6 py-5 last:border-b-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-serif text-xl text-foreground">{item.value}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
