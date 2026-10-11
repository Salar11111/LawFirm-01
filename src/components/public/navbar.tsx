'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu, LogOut, LayoutDashboard, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/lib/types'

const NAV_ITEMS: { label: string; view: ViewMode }[] = [
  { label: 'Home', view: 'home' },
  { label: 'Practice Areas', view: 'practice-areas' },
  { label: 'About', view: 'about' },
  { label: 'Our Team', view: 'team' },
  { label: 'Contact', view: 'contact' },
]

export function Navbar() {
  const { view, setView, user, logout, setLoginOpen } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handlePortal = () => {
    if (!user) {
      setLoginOpen(true)
    } else if (user.role === 'CLIENT') {
      setView('client-portal')
    } else {
      setView('admin-portal')
    }
  }

  const go = (v: ViewMode) => {
    setView(v)
    setMobileOpen(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={cn(
                'relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                view === item.view
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-foreground',
              )}
            >
              {item.label}
              {view === item.view && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button onClick={handlePortal} size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {user.role === 'CLIENT' ? 'Client Portal' : 'Dashboard'}
              </Button>
              <Button onClick={logout} size="sm" variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => setLoginOpen(true)}
                size="sm"
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => useAppStore.getState().setRegisterOpen(true)}
                size="sm"
                className="hidden sm:inline-flex"
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <Logo />
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.view}
                      onClick={() => go(item.view)}
                      className={cn(
                        'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                        view === item.view
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/70 hover:bg-muted',
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-auto border-t p-4 space-y-2">
                  {user ? (
                    <>
                      <Button onClick={() => { handlePortal(); setMobileOpen(false) }} className="w-full gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {user.role === 'CLIENT' ? 'Client Portal' : 'Dashboard'}
                      </Button>
                      <Button onClick={() => { logout(); setMobileOpen(false) }} variant="outline" className="w-full gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => { setLoginOpen(true); setMobileOpen(false) }}
                        variant="outline"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => { useAppStore.getState().setRegisterOpen(true); setMobileOpen(false) }}
                        className="w-full"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
