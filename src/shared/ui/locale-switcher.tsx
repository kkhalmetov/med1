'use client'

import { Languages } from 'lucide-react'
import { useLocale } from 'next-intl'
import { startTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/shared/i18n/locale'

export function LocaleSwitcher() {
  const current = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(locale: Locale) {
    startTransition(() => router.replace(pathname, { locale }))
  }

  return (
    <div className="locale-switcher" aria-label="Тіл / Язык">
      <Languages aria-hidden="true" size={17} />
      <button aria-pressed={current === 'kk'} onClick={() => switchTo('kk')} type="button">
        ҚАЗ
      </button>
      <span aria-hidden="true">/</span>
      <button aria-pressed={current === 'ru'} onClick={() => switchTo('ru')} type="button">
        РУС
      </button>
    </div>
  )
}
