'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api, formatCompact } from '@/lib/helpers'
import { Award, Users, Gavel, Star, TrendingUp, Clock } from 'lucide-react'

interface Stats {
  cases: number
  clients: number
  lawyers: number
  reviews: number
  wonCases: number
  avgRating: number
  successRate: number
}

export function Stats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api<{ stats: Stats }>('/api/stats').then(({ stats }) => setStats(stats)).catch(() => {})
  }, [])

  const items = [
    { icon: Gavel, label: 'Cases Handled', value: stats ? formatCompact(stats.cases) : '—', suffix: '' },
    { icon: Users, label: 'Happy Clients', value: stats ? formatCompact(stats.clients) : '—', suffix: '' },
    { icon: Award, label: 'Cases Won', value: stats ? String(stats.wonCases) : '—', suffix: '' },
    { icon: Star, label: 'Avg. Rating', value: stats ? stats.avgRating.toFixed(1) : '—', suffix: stats ? '/5' : '' },
  ]

  return (
    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground lg:py-20">
      <div className="absolute inset-0 bg-pattern-dots opacity-10" />
      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
                <item.icon className="h-7 w-7" />
              </div>
              <p className="mt-4 font-serif text-4xl font-bold lg:text-5xl">
                {item.value}<span className="text-accent">{item.suffix}</span>
              </p>
              <p className="mt-1 text-sm text-primary-foreground/80">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
