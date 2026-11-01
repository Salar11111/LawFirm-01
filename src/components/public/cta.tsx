'use client'

import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, ArrowRight } from 'lucide-react'

export function CTA() {
  const { openBooking } = useAppStore()

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="border-y-2 border-accent bg-primary px-6 py-12 text-center text-primary-foreground lg:px-12 lg:py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Facing a Legal Challenge?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Don&apos;t navigate the law alone. Our experienced advocates are ready to protect your
              rights and guide you to the best possible outcome.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => openBooking()}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Book Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/contact">
                  <Phone className="h-4 w-4" />
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/70">
              First consultation is complimentary · Confidential &amp; no obligation
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
