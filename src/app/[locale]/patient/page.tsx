import { getTranslations } from 'next-intl/server'
import { ArrowRight, ClipboardCheck, MessageCircle, PackageOpen } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Card } from '@/shared/ui/card'
import { StatusBadge } from '@/shared/ui/status-badge'

export default async function PatientHomePage() {
  const t = await getTranslations()
  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Qadam</p>
          <h1>{t('dashboard.patientTitle')}</h1>
        </div>
        <StatusBadge tone="success">{t('enums.GREEN')}</StatusBadge>
      </header>
      <section className="dashboard-grid dashboard-grid--patient">
        <Card className="dashboard-action" eyebrow={t('common.today')} title={t('reports.new')}>
          <p>{t('landing.stepOne')}</p>
          <Link className="button button--primary" href="/patient/reports/new">
            {t('reports.new')} <ArrowRight size={18} />
          </Link>
        </Card>
        <Card title={t('devices.title')}>
          <div className="empty-illustration">
            <PackageOpen />
            <span>{t('common.loading')}</span>
          </div>
        </Card>
        <Card title={t('reports.history')}>
          <div className="empty-illustration">
            <ClipboardCheck />
            <span>{t('common.loading')}</span>
          </div>
        </Card>
        <Card title={t('chat.title')}>
          <div className="empty-illustration">
            <MessageCircle />
            <span>{t('common.loading')}</span>
          </div>
        </Card>
      </section>
    </div>
  )
}
