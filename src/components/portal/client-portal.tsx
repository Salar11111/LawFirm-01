'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { PortalSidebar, type PortalSection } from './client/portal-sidebar'
import { OverviewSection } from './client/overview-section'
import { CasesSection } from './client/cases-section'
import { AppointmentsSection } from './client/appointments-section'
import { DocumentsSection } from './client/documents-section'
import { InvoicesSection } from './client/invoices-section'
import { MessagesSection } from './client/messages-section'
import { ProfileSection } from './client/profile-section'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { CalendarPlus, Menu } from 'lucide-react'

const SECTION_META: Record<PortalSection, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Welcome to your client dashboard' },
  cases: { title: 'My Cases', subtitle: 'Track the progress of your legal matters' },
  appointments: { title: 'Appointments', subtitle: 'Your scheduled meetings with our lawyers' },
  documents: { title: 'Documents', subtitle: 'Files shared on your cases' },
  invoices: { title: 'Invoices', subtitle: 'Billing and payment history' },
  messages: { title: 'Messages', subtitle: 'Secure chat with your legal team' },
  profile: { title: 'Profile', subtitle: 'Your personal account information' },
}

export function ClientPortal({ section }: { section: PortalSection }) {
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const hydrated = useAppStore((s) => s.hydrated)
  const openBooking = useAppStore((s) => s.openBooking)
  const [mobileOpen, setMobileOpen] = useState(false)

  const setSection = (next: PortalSection) => {
    router.push(next === 'overview' ? '/portal' : `/portal/${next}`)
  }

  if (!hydrated) {
    return <div className="p-8 text-sm text-muted-foreground">Loading your account…</div>
  }
  if (!user) return null

  const meta = SECTION_META[section]

  const renderSection = () => {
    switch (section) {
      case 'overview':
        return <OverviewSection onNavigate={setSection} />
      case 'cases':
        return <CasesSection />
      case 'appointments':
        return <AppointmentsSection />
      case 'documents':
        return <DocumentsSection />
      case 'invoices':
        return <InvoicesSection />
      case 'messages':
        return <MessagesSection />
      case 'profile':
        return <ProfileSection />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-screen">
          <PortalSidebar
            activeSection={section}
            onSectionChange={setSection}
            user={user}
          />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:w-80">
          <SheetTitle className="sr-only">Client portal navigation</SheetTitle>
          <PortalSidebar
            activeSection={section}
            onSectionChange={setSection}
            user={user}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-lg font-bold leading-tight text-foreground sm:text-xl">
                {meta.title}
              </h1>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
            </div>
            <Button onClick={() => openBooking()} className="shrink-0 gap-2" size="sm">
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Book Consultation</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-6xl">{renderSection()}</div>
        </main>
      </div>
    </div>
  )
}
