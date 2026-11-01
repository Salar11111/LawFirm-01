'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu, LogOut, LayoutDashboard, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Practice Areas', href: '/practice-areas' },
  { label: 'About', href: '/about' },
  { label: 'Our Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
]

function isCurrent(href: string, pathname: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, setLoginOpen } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const portalHref = user?.role === 'CLIENT' ? '/portal' : '/dashboard'

  const handlePortal = () => {
    if (!user) setLoginOpen(true)
    else router.push(portalHref)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
    router.push('/')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-300',
        scrolled ? 'border-border bg-background/95 backdrop-blur' : 'border-transparent bg-background',
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isCurrent(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'text-primary' : 'text-foreground/70 hover:text-foreground',
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button onClick={handlePortal} size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {user.role === 'CLIENT' ? 'Client Portal' : 'Dashboard'}
              </Button>
              <Button onClick={handleLogout} size="sm" variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button onClick={() => setLoginOpen(true)} size="sm" variant="ghost" className="hidden sm:inline-flex">
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

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 sm:w-[340px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <Logo />
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  {NAV_ITEMS.map((item) => {
                    const active = isCurrent(item.href, pathname)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                          active ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted',
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto space-y-2 border-t p-4">
                  {user ? (
                    <>
                      <Button onClick={handlePortal} className="w-full gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {user.role === 'CLIENT' ? 'Client Portal' : 'Dashboard'}
                      </Button>
                      <Button onClick={handleLogout} variant="outline" className="w-full gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setLoginOpen(true)
                          setMobileOpen(false)
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          useAppStore.getState().setRegisterOpen(true)
                          setMobileOpen(false)
                        }}
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
