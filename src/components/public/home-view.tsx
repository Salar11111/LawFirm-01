'use client'

import { Hero } from '@/components/public/hero'
import { PracticeAreas } from '@/components/public/practice-areas'
import { Stats } from '@/components/public/stats'
import { About } from '@/components/public/about'
import { Process } from '@/components/public/process'
import { Team } from '@/components/public/team'
import { Testimonials } from '@/components/public/testimonials'
import { CTA } from '@/components/public/cta'
import { Contact } from '@/components/public/contact'

export function HomeView() {
  return (
    <>
      <Hero />
      <PracticeAreas />
      <Stats />
      <About />
      <Process />
      <Team />
      <Testimonials />
      <CTA />
      <Contact />
    </>
  )
}
