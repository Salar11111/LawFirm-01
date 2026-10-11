'use client'

import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function CTA() {
  const { openBooking, setView } = useAppStore()

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-12 text-center text-primary-foreground shadow-2xl lg:px-12 lg:py-16"
        >
          <div className="absolute inset-0 bg-pattern-dots opacity-10" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
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
                onClick={() => setView('contact')}
                className="border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2"
              >
                <Phone className="h-4 w-4" />
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/70">
              First consultation is complimentary · Confidential &amp; no obligation
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
