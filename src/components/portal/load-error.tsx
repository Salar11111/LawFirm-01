'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function LoadError({
  title = 'This section could not be loaded',
  detail = 'Check your connection and try again.',
  onRetry,
}: {
  title?: string
  detail?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="mt-4 font-serif text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
