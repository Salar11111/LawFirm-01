'use client'

import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, CheckCircle2, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const VALUES = [
  {
    title: 'Integrity First',
    description: 'We uphold the highest ethical standards, maintaining honesty and transparency in every case.',
  },
  {
    title: 'Client-Focused',
    description: 'Your interests come first. We tailor our strategy to your unique circumstances and goals.',
  },
  {
    title: 'Relentless Advocacy',
    description: 'We fight tirelessly for your rights, leaving no stone unturned in pursuit of justice.',
  },
  {
    title: 'Deep Expertise',
    description: 'Our team combines decades of Pakistani legal practice with modern, strategic thinking.',
  },
]

const HIGHLIGHTS = [
  'Recognised by Pakistan Bar Council',
  'Representation in Supreme Court & all High Courts',
  'Multilingual team (English, Urdu, regional)',
  'Confidential & discreet case handling',
  'Transparent, fair fee structure',
  '24/7 client support & updates',
]

export function About() {
  const { openBooking } = useAppStore()

  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 p-8 lg:p-10">
              <Quote className="h-10 w-10 text-accent" />
              <p className="mt-4 font-serif text-xl leading-relaxed text-foreground lg:text-2xl">
                &ldquo;The foundation of justice is good faith, and its culmination is fairness to all.&rdquo;
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-foreground">Barrister Imran Ahmed</p>
                <p className="text-sm text-muted-foreground">Managing Partner, Shaheen Law Associates</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card className="p-5">
                <p className="font-serif text-3xl font-bold text-primary">1998</p>
                <p className="mt-1 text-xs text-muted-foreground">Year Established</p>
              </Card>
              <Card className="p-5">
                <p className="font-serif text-3xl font-bold text-primary">3</p>
                <p className="mt-1 text-xs text-muted-foreground">Offices in Pakistan</p>
              </Card>
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">About Our Firm</span>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A Legacy of Legal Excellence in Pakistan
            </h2>
            <p className="mt-5 text-muted-foreground">
              Founded in 1998, Shaheen Law Associates has grown into one of Pakistan&apos;s most
              respected law firms. From our headquarters on I.I. Chundrigar Road in Karachi, we
              represent clients before the Supreme Court of Pakistan, all High Courts, and district
              courts nationwide.
            </p>
            <p className="mt-3 text-muted-foreground">
              Our team blends deep expertise in Pakistani statutes — from the Constitution and
              Pakistan Penal Code to the Muslim Family Laws Ordinance and Companies Act — with a
              modern, client-first approach.
            </p>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {HIGHLIGHTS.map((h) => (
                <div key={h} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href="/about">More About Us <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" onClick={() => openBooking()}>Schedule a Meeting</Button>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                  <span className="font-serif text-lg font-bold">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Story</span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          About Shaheen Law Associates
        </h1>
        <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Established in 1998 by Barrister Imran Ahmed, Shaheen Law Associates began as a small
            chambers on Karachi&apos;s historic I.I. Chundrigar Road. Over more than two decades, we have
            grown into a full-service law firm with offices in Karachi, Lahore, and Islamabad, serving
            clients across Pakistan and overseas Pakistanis worldwide.
          </p>
          <p>
            Our firm has built its reputation on a simple principle: every client deserves
            world-class legal representation, regardless of the size of their matter. From complex
            corporate disputes to sensitive family proceedings, we bring the same level of dedication,
            preparation, and strategic thinking.
          </p>
          <p>
            We are proud to have represented clients before the Supreme Court of Pakistan, the Sindh,
            Lahore, and Islamabad High Courts, Banking Courts, Family Courts, NAB Courts, and the
            Appellate Tribunal Inland Revenue. Our advocates are members of the Sindh Bar Council and
            the Pakistan Bar Council.
          </p>
          <p>
            At Shaheen Law Associates, we believe the law is not just a profession — it is a sacred
            trust. We honour that trust by fighting for justice with integrity, diligence, and an
            unwavering commitment to our clients.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <About />
      </div>
    </div>
  )
}
