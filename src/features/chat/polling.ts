'use client'

import { useEffect } from 'react'

export function pollingAllowed(visibility: DocumentVisibilityState, online: boolean) {
  return visibility === 'visible' && online
}

export function useSafePolling(callback: () => void, intervalMs: number, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const tick = () => {
      if (pollingAllowed(document.visibilityState, navigator.onLine)) callback()
    }
    const timer = window.setInterval(tick, intervalMs)
    window.addEventListener('online', tick)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('online', tick)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [callback, enabled, intervalMs])
}
