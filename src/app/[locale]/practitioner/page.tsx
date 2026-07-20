import { getTranslations } from 'next-intl/server'
import { Card } from '@/shared/ui/card'
import { StatusBadge } from '@/shared/ui/status-badge'

export default async function PractitionerHomePage() {
  const t = await getTranslations()
  const stats = [
    [t('dashboard.attention'), '0', 'danger'],
    [t('dashboard.uncheckedReports'), '0', 'warning'],
    [t('dashboard.newComplaints'), '0', 'info'],
    [t('dashboard.unreadMessages'), '0', 'neutral'],
  ] as const
  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Qadam</p>
          <h1>{t('dashboard.practitionerTitle')}</h1>
        </div>
      </header>
      <section className="stat-grid">
        {stats.map(([label, value, tone]) => (
          <Card key={label}>
            <StatusBadge tone={tone}>{label}</StatusBadge>
            <strong className="stat-card__value">{value}</strong>
          </Card>
        ))}
      </section>
      <Card title={t('patients.title')}>
        <div className="empty-state">{t('common.loading')}</div>
      </Card>
    </div>
  )
}
