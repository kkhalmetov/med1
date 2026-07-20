'use client'

import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

export function LogoutButton() {
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
    <button className="app-shell__logout" disabled={pending} onClick={logout} type="button">
      <LogOut aria-hidden="true" size={18} />
      <span>{t('logout')}</span>
    </button>
  )
}
