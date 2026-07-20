import { Building2, IdCard, PackageOpen, Stethoscope } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function AdminHomePage() {
  const t = await getTranslations()
  const entries = [
    ['/admin/qualifications', t('nav.qualifications'), IdCard],
    ['/admin/organizations', t('nav.organizations'), Building2],
    ['/admin/practitioners', t('nav.practitioners'), Stethoscope],
    ['/admin/devices', t('nav.devices'), PackageOpen],
  ] as const
  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Qadam</p>
          <h1>{t('dashboard.adminTitle')}</h1>
        </div>
      </header>
      <section className="admin-entry-grid">
        {entries.map(([href, label, Icon]) => (
          <Link href={href} key={href}>
            <Icon aria-hidden="true" />
            <strong>{label}</strong>
            <span>→</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
