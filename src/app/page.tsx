'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Navbar } from '@/components/public/navbar'
import { Footer } from '@/components/public/footer'
import { LoginDialog } from '@/components/auth/login-dialog'
import { RegisterDialog } from '@/components/auth/register-dialog'
import { BookingDialog } from '@/components/booking/booking-dialog'
import { HomeView } from '@/components/public/home-view'
import { PracticeAreasPage } from '@/components/public/practice-areas'
import { AboutPage } from '@/components/public/about'
import { TeamPage } from '@/components/public/team'
import { ContactPage } from '@/components/public/contact'
import { ClientPortal } from '@/components/portal/client-portal'
import { AdminPortal } from '@/components/portal/admin-portal'
import { api } from '@/lib/helpers'
import type { User } from '@/lib/types'

export default function Home() {
  const { view, user, setUser, setHydrated, hydrated } = useAppStore()

  // Restore session on mount
  useEffect(() => {
    api<{ user: User | null }>('/api/auth/me')
      .then(({ user }) => { if (user) setUser(user) })
      .catch(() => {})
      .finally(() => setHydrated(true))
  }, [setUser, setHydrated])

  // Guard portals — if not hydrated yet, show nothing; if no user, redirect to home
  useEffect(() => {
    if (!hydrated) return
    if ((view === 'client-portal' || view === 'admin-portal') && !user) {
      useAppStore.getState().setLoginOpen(true)
      useAppStore.getState().setView('home')
    }
    if (view === 'client-portal' && user && user.role !== 'CLIENT') {
      useAppStore.getState().setView('admin-portal')
    }
    if (view === 'admin-portal' && user && user.role === 'CLIENT') {
      useAppStore.getState().setView('client-portal')
    }
  }, [view, user, hydrated])

  const renderView = () => {
    switch (view) {
      case 'practice-areas':
        return <PracticeAreasPage />
      case 'about':
        return <AboutPage />
      case 'team':
        return <TeamPage />
      case 'contact':
        return <ContactPage />
      case 'client-portal':
        return user ? <ClientPortal /> : null
      case 'admin-portal':
        return user ? <AdminPortal /> : null
      default:
        return <HomeView />
    }
  }

  const isPortal = view === 'client-portal' || view === 'admin-portal'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{renderView()}</main>
      {!isPortal && <Footer />}
      <LoginDialog />
      <RegisterDialog />
      <BookingDialog />
    </div>
  )
}
