import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Brand({ compact = false, href = '/' }: { compact?: boolean; href?: string }) {
  const t = useTranslations('brand')
  const content = (
    <>
      <Image alt="" height={42} priority src="/icons/qadamm-q.svg" width={42} />
      <span>
        <strong>{t('name')}</strong>
        {compact ? null : <small>{t('slogan')}</small>}
      </span>
    </>
  )

  return href === '#top' ? (
    <a className="brand" href="#top" aria-label={t('name')}>
      {content}
    </a>
  ) : (
    <Link className="brand" href={href} aria-label={t('name')}>
      {content}
    </Link>
  )
}
