'use client'

import { useState } from 'react'

interface RequestState<T> {
  key: string
  data: T | null
  error: boolean
}

/**
 * Tracks an async request without mirroring a loading flag into state from an
 * effect. Loading and error are derived from the key of the request that
 * produced the current data, so changing the key (filters, retry counter,
 * selection, etc.) immediately puts the UI into its loading state. Only the
 * async callbacks settle the state.
 */
export function useRequestState<T>(key: string) {
  const [state, setState] = useState<RequestState<T>>({ key: '', data: null, error: false })

  const settle = (data: T) => setState({ key, data, error: false })
  const fail = () => setState((previous) => ({ key, data: previous.data, error: true }))
  const update = (updater: (data: T) => T) =>
    setState((previous) =>
      previous.data === null ? previous : { ...previous, data: updater(previous.data) },
    )

  return {
    data: state.data,
    loading: state.key !== key,
    error: state.key === key && state.error,
    settle,
    fail,
    update,
  }
}
