'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { api } from '@/lib/helpers'
import type { User } from '@/lib/types'

export function AuthEffects() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAppStore((s) => s.setUser)
  const setHydrated = useAppStore((s) => s.setHydrated)
  const setLoginOpen = useAppStore((s) => s.setLoginOpen)

  useEffect(() => {
    let cancelled = false
    api<{ user: User | null }>('/api/auth/me')
      .then(({ user }) => {
        if (!cancelled && user) setUser(user)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [setUser, setHydrated])

  useEffect(() => {
    if (searchParams.get('login') !== 'true') return
    setLoginOpen(true)
    router.replace('/')
  }, [searchParams, setLoginOpen, router])

  return null
}
