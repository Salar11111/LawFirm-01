'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { PhoneCall, FileSearch, Gavel, Trophy } from 'lucide-react'

const STEPS = [
  {
    icon: PhoneCall,
    title: 'Initial Consultation',
    description: 'We discuss your matter, understand your goals, and assess the legal merits of your case — at no cost.',
  },
  {
    icon: FileSearch,
    title: 'Case Strategy',
    description: 'Our team reviews documents, researches precedents, and crafts a tailored legal strategy.',
  },
  {
    icon: Gavel,
    title: 'Active Representation',
    description: 'We file petitions, represent you in court, and keep you informed at every stage.',
  },
  {
    icon: Trophy,
    title: 'Resolution',
    description: 'We pursue the best possible outcome — through judgment, settlement, or appeal.',
  },
]

export function Process() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">How We Work</span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Your Journey With Us
          </h2>
          <p className="mt-4 text-muted-foreground">
            A clear, transparent process from your first call to the final resolution.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/5" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-md ring-1 ring-border">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
