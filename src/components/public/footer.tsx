'use client'

import { useAppStore } from '@/store/app-store'
import { Logo } from '@/components/shared/logo'
import { MapPin, Phone, Mail, Clock, Facebook, Linkedin, Twitter, Send } from 'lucide-react'
import type { ViewMode } from '@/lib/types'

export function Footer() {
  const setView = useAppStore((s) => s.setView)
  const setLoginOpen = useAppStore((s) => s.setLoginOpen)

  const quickLinks: { label: string; view: ViewMode }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Practice Areas', view: 'practice-areas' },
    { label: 'About Us', view: 'about' },
    { label: 'Our Team', view: 'team' },
    { label: 'Contact', view: 'contact' },
  ]

  return (
    <footer className="mt-auto bg-foreground text-background">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="rounded-lg bg-background/5 p-2 -m-2">
              <Logo onDark />
            </div>
            <p className="text-sm leading-relaxed text-background/70">
              A premier Pakistani law firm delivering trusted legal counsel since 1998. We combine
              deep knowledge of Pakistani law with modern practice to protect your rights.
            </p>
            <div className="flex gap-3">
              {[Linkedin, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-background/20"
                  aria-label="Social media"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => setView(link.view)}
                    className="text-sm text-background/70 transition-colors hover:text-background"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-sm text-background/70 transition-colors hover:text-background"
                >
                  Client Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Practice areas */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Practice Areas</h3>
            <ul className="space-y-2.5 text-sm text-background/70">
              <li><button onClick={() => setView('practice-areas')} className="hover:text-background">Family Law</button></li>
              <li><button onClick={() => setView('practice-areas')} className="hover:text-background">Corporate & Commercial</button></li>
              <li><button onClick={() => setView('practice-areas')} className="hover:text-background">Criminal Defense</button></li>
              <li><button onClick={() => setView('practice-areas')} className="hover:text-background">Property & Real Estate</button></li>
              <li><button onClick={() => setView('practice-areas')} className="hover:text-background">Banking & Finance</button></li>
              <li><button onClick={() => setView('practice-areas')} className="hover:text-background">Constitutional Law</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <span>Suite 1201, Business Avenue, I.I. Chundrigar Road, Karachi, Pakistan</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <a href="tel:+922135379900" className="hover:text-background">+92 21 3537 9900</a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <a href="mailto:info@shaheenlaw.pk" className="hover:text-background">info@shaheenlaw.pk</a>
              </li>
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 text-sm text-background/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Shaheen Law Associates. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="hover:text-background transition-colors">Privacy Policy</button>
            <button className="hover:text-background transition-colors">Terms of Service</button>
            <span className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Made in Pakistan
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
