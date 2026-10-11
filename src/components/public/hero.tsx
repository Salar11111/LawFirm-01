'use client'

import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { ArrowRight, Scale, ShieldCheck, Award, PhoneCall } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  const { setView, openBooking, setLoginOpen, user } = useAppStore()

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Trusted Legal Counsel Since 1998
            </div>

            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Justice,{" "}
              <span className="relative text-primary">
                Delivered
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                  <path d="M0 4 Q50 0 100 4 T200 4" stroke="currentColor" strokeWidth="3" className="text-accent" fill="none" strokeLinecap="round" />
                </svg>
              </span>{" "}
              with Honour
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Shaheen Law Associates is a leading Pakistani law firm protecting the rights of
              individuals and businesses across family, corporate, criminal, property, and
              constitutional matters — from Karachi to Islamabad.
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
                <Button size="lg" variant="outline" onClick={() => setView(user.role === 'CLIENT' ? 'client-portal' : 'admin-portal')}>
                  Go to My Portal
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">25+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">1,200+ Cases Won</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">All Courts of Pakistan</span>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Main card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-2xl">
                <div className="absolute inset-0 rounded-3xl bg-pattern-dots opacity-20" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
                      <Scale className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium backdrop-blur">
                      Active Cases
                    </span>
                  </div>
                  <div className="mt-8">
                    <p className="font-serif text-5xl font-bold">1,250+</p>
                    <p className="mt-1 text-sm text-primary-foreground/80">Cases successfully handled</p>
                  </div>
                  <div className="mt-8 space-y-3">
                    {[
                      { label: 'Family Law', pct: 85 },
                      { label: 'Corporate Law', pct: 72 },
                      { label: 'Criminal Defense', pct: 91 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs">
                          <span className="text-primary-foreground/80">{item.label}</span>
                          <span className="font-medium">{item.pct}% success</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="h-full rounded-full bg-accent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-6 rounded-2xl bg-background p-4 shadow-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <PhoneCall className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24/7 Legal Helpline</p>
                    <p className="text-sm font-semibold text-foreground">+92 21 3537 9900</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating rating */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-2 rounded-2xl bg-background p-4 shadow-xl border border-border"
              >
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1l2.6 6.3 6.4.5-4.9 4.2 1.5 6.5L10 15l-5.6 3.5L5.9 12 1 7.8l6.4-.5z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1 text-xs font-medium text-foreground">4.9 / 5.0 rating</p>
                <p className="text-[10px] text-muted-foreground">from 320+ clients</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
