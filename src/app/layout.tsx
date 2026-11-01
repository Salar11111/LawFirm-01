import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { AuthEffects } from '@/components/auth/auth-effects'
import { LoginDialog } from '@/components/auth/login-dialog'
import { RegisterDialog } from '@/components/auth/register-dialog'
import { BookingDialog } from '@/components/booking/booking-dialog'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'Shaheen Law Associates | Premier Law Firm in Pakistan',
    template: '%s | Shaheen Law Associates',
  },
  description:
    'Shaheen Law Associates — a Pakistani law firm offering counsel in family, corporate, criminal, property, banking, constitutional, tax, and cyber law. Chambers in Karachi, Lahore, and Islamabad.',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}>
        <Suspense fallback={null}>
          <AuthEffects />
        </Suspense>
        {children}
        <LoginDialog />
        <RegisterDialog />
        <BookingDialog />
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  )
}
