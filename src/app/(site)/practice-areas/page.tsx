import type { Metadata } from 'next'
import { PracticeAreasPage } from '@/components/public/practice-areas'

export const metadata: Metadata = {
  title: 'Practice Areas',
  description: 'Family, corporate, criminal, property, banking, constitutional, tax, and cyber law.',
}

export default function Page() {
  return <PracticeAreasPage />
}
