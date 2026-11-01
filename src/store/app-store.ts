import { create } from 'zustand'
import type { User } from '@/lib/types'
import { api } from '@/lib/helpers'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>

  loginOpen: boolean
  setLoginOpen: (open: boolean) => void
  registerOpen: boolean
  setRegisterOpen: (open: boolean) => void
  bookingOpen: boolean
  bookingLawyerId: string | null
  openBooking: (lawyerId?: string | null) => void
  setBookingOpen: (open: boolean) => void

  selectedPracticeArea: string | null
  setSelectedPracticeArea: (slug: string | null) => void

  hydrated: boolean
  setHydrated: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // The local session still ends if the request fails.
    }
    set({ user: null })
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
