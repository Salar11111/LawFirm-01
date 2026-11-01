'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { SidebarContent, type AdminSection } from './admin/sidebar-content'
import { DashboardSection } from './admin/dashboard-section'
import { CasesSection } from './admin/cases-section'
import { ClientsSection } from './admin/clients-section'
import { AppointmentsSection } from './admin/appointments-section'
import { DocumentsSection } from './admin/documents-section'
import { InvoicesSection } from './admin/invoices-section'
import { TeamSection } from './admin/team-section'
import { MessagesSection } from './admin/messages-section'
import { InquiriesSection } from './admin/inquiries-section'

export function AdminPortal({ section }: { section: AdminSection }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAppStore((s) => s.user)
  const hydrated = useAppStore((s) => s.hydrated)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeCaseId = searchParams.get('case')

  const handleSelect = useCallback((next: AdminSection) => {
    setMobileOpen(false)
    router.push(next === 'dashboard' ? '/dashboard' : `/dashboard/${next}`)
  }, [router])

  const handleOpenCase = useCallback((caseId: string) => {
    router.push(`/dashboard/cases?case=${caseId}`)
  }, [router])

  const setActiveCaseId = useCallback((caseId: string | null) => {
    router.replace(caseId ? `/dashboard/cases?case=${caseId}` : '/dashboard/cases')
  }, [router])

  if (!hydrated) {
    return <div className="p-8 text-sm text-muted-foreground">Loading your account…</div>
  }
  if (!user) return null

  const renderSection = () => {
    switch (section) {
      case 'dashboard':
        return <DashboardSection onOpenCase={handleOpenCase} />
      case 'cases':
        return (
          <CasesSection
            user={user}
            activeCaseId={activeCaseId}
            onActiveCaseChange={setActiveCaseId}
          />
        )
      case 'clients':
        return <ClientsSection user={user} onOpenCase={handleOpenCase} />
      case 'appointments':
        return <AppointmentsSection />
      case 'documents':
        return <DocumentsSection />
      case 'invoices':
        return <InvoicesSection />
      case 'team':
        return <TeamSection />
      case 'messages':
        return <MessagesSection />
      case 'inquiries':
        return <InquiriesSection />
      default:
        return <DashboardSection onOpenCase={handleOpenCase} />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent active={section} onSelect={handleSelect} user={user} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent active={section} onSelect={handleSelect} user={user} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-serif text-base font-bold text-foreground">Shaheen Law</span>
          <span className="w-9" />
        </div>

        <main className="min-w-0 flex-1">{renderSection()}</main>
      </div>
    </div>
  )
}
