import type { Metadata } from 'next'
import { AboutPage } from '@/components/public/about'

export const metadata: Metadata = {
  title: 'About',
  description: 'Chambers in Karachi, Lahore, and Islamabad since 1998.',
}

export default function Page() {
  return <AboutPage />
}
