import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Brand({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('brand')
  return (
    <Link className="brand" href="/" aria-label="Qadam">
      <Image alt="" height={42} priority src="/icons/qadam.svg" width={42} />
      <span>
        <strong>Qadam</strong>
        {compact ? null : <small>{t('slogan')}</small>}
      </span>
    </Link>
  )
}
