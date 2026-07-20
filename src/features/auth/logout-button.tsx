'use client'

import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.replace('/')
      router.refresh()
    }
  }

  return (
    <button
      aria-label={compact ? t('logout') : undefined}
      className={`app-shell__logout${compact ? ' app-shell__logout--compact' : ''}`}
      disabled={pending}
      onClick={logout}
      type="button"
    >
      <LogOut aria-hidden="true" size={18} />
      <span className={compact ? 'sr-only' : undefined}>{t('logout')}</span>
    </button>
  )
}
