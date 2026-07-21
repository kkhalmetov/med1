'use client'

import { Building2, IdCard, PackageOpen, Stethoscope } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useApiQuery } from '@/shared/api/use-api-query'

const resources = [
  ['qualifications', '/qualifications', IdCard],
  ['organizations', '/organizations', Building2],
  ['practitioners', '/practitioners', Stethoscope],
  ['devices', '/devices', PackageOpen],
] as const

function ResourceEntry({
  resource,
  path,
  Icon,
}: {
  resource: (typeof resources)[number][0]
  path: string
  Icon: (typeof resources)[number][2]
}) {
  const t = useTranslations('nav')
  const query = useApiQuery<unknown[]>(['admin', resource], path)
  return (
    <Link href={`/admin/${resource}`}>
      <Icon aria-hidden="true" />
      <strong>{t(resource)}</strong>
      <span className="admin-entry__count">{query.data?.length ?? '—'}</span>
    </Link>
  )
}

export function AdminDashboard() {
  const t = useTranslations('dashboard')
  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">QadamAI</p>
          <h1>{t('adminTitle')}</h1>
        </div>
      </header>
      <section className="admin-entry-grid">
        {resources.map(([resource, path, Icon]) => (
          <ResourceEntry Icon={Icon} key={resource} path={path} resource={resource} />
        ))}
      </section>
    </div>
  )
}
