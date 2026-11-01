import type { Metadata } from 'next'
import { TeamPage } from '@/components/public/team'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Advocates and barristers at Shaheen Law Associates.',
}

export default function Page() {
  return <TeamPage />
}
