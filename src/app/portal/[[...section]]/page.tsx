import { redirect } from 'next/navigation'
import { ClientPortal } from '@/components/portal/client-portal'
import type { PortalSection } from '@/components/portal/client/portal-sidebar'

const SECTIONS = new Set<PortalSection>([
  'overview',
  'cases',
  'appointments',
  'documents',
  'invoices',
  'messages',
  'profile',
])

export default async function PortalPage({
  params,
}: {
  params: Promise<{ section?: string[] }>
}) {
  const { section } = await params
  if (section && section.length > 1) redirect('/portal')
  const current = section?.[0] ?? 'overview'
  if (!SECTIONS.has(current as PortalSection)) redirect('/portal')
  return <ClientPortal section={current as PortalSection} />
}
