import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { AdminPortal } from '@/components/portal/admin-portal'
import type { AdminSection } from '@/components/portal/admin/sidebar-content'

const SECTIONS = new Set<AdminSection>([
  'dashboard',
  'cases',
  'clients',
  'appointments',
  'documents',
  'invoices',
  'team',
  'messages',
  'inquiries',
])

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ section?: string[] }>
}) {
  const { section } = await params
  if (section && section.length > 1) redirect('/dashboard')
  const current = section?.[0] ?? 'dashboard'
  if (!SECTIONS.has(current as AdminSection)) redirect('/dashboard')
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading your account…</div>}>
      <AdminPortal section={current as AdminSection} />
    </Suspense>
  )
}
