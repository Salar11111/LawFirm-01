import { create } from 'zustand'
import type { User, ViewMode } from '@/lib/types'

interface AppState {
  // Navigation
  view: ViewMode
  setView: (view: ViewMode) => void

  // Auth
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void

  // UI
  loginOpen: boolean
  setLoginOpen: (open: boolean) => void
  registerOpen: boolean
  setRegisterOpen: (open: boolean) => void
  bookingOpen: boolean
  bookingLawyerId: string | null
  openBooking: (lawyerId?: string | null) => void
  setBookingOpen: (open: boolean) => void

  // Selected practice area for detail dialog
  selectedPracticeArea: string | null
  setSelectedPracticeArea: (slug: string | null) => void

  // Hydration flag
  hydrated: boolean
  setHydrated: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'home',
  setView: (view) => {
    set({ view })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    set({ user: null, view: 'home' })
  },

  loginOpen: false,
  setLoginOpen: (loginOpen) => set({ loginOpen }),
  registerOpen: false,
  setRegisterOpen: (registerOpen) => set({ registerOpen }),
  bookingOpen: false,
  bookingLawyerId: null,
  openBooking: (lawyerId = null) => set({ bookingOpen: true, bookingLawyerId: lawyerId }),
  setBookingOpen: (bookingOpen) => set({ bookingOpen }),

  selectedPracticeArea: null,
  setSelectedPracticeArea: (selectedPracticeArea) => set({ selectedPracticeArea }),

  hydrated: false,
  setHydrated: (hydrated) => set({ hydrated }),
}))
