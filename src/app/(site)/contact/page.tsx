import type { Metadata } from 'next'
import { ContactPage } from '@/components/public/contact'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Write to Shaheen Law Associates or book a consultation.',
}

export default function Page() {
  return <ContactPage />
}
