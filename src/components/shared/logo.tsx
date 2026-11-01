'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2.5', className)}
      aria-label="Shaheen Law Associates home"
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M12 2 L4 7 L4 11 L12 8 L20 11 L20 7 Z" fill="currentColor" opacity="0.9" />
          <path d="M12 9 L9 14 L12 13 L15 14 Z" fill="currentColor" />
          <rect x="11.3" y="13.5" width="1.4" height="6.5" fill="currentColor" />
          <path d="M7 16 L11.3 15 L11.3 16.5 L7 17.5 Z" fill="currentColor" opacity="0.85" />
          <path d="M17 16 L12.7 15 L12.7 16.5 L17 17.5 Z" fill="currentColor" opacity="0.85" />
        </svg>
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className={cn('font-serif text-lg font-bold tracking-tight', onDark ? 'text-white' : 'text-foreground')}>
          Shaheen Law
        </span>
        <span className={cn('text-[10px] font-medium uppercase tracking-[0.2em]', onDark ? 'text-white/70' : 'text-muted-foreground')}>
          Associates
        </span>
      </span>
    </Link>
  )
}
