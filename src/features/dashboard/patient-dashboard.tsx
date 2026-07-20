'use client'

import { Activity, MessageCircle, PackageOpen, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { components } from '@/shared/api/schema'
import { useApiQuery } from '@/shared/api/use-api-query'
import { Link } from '@/i18n/navigation'
import { Card } from '@/shared/ui/card'
import { StatusBadge } from '@/shared/ui/status-badge'

type Patient = components['schemas']['PatientResponse']
type Dispense = components['schemas']['DeviceDispenseResponse']
type Report = components['schemas']['QuestionnaireResponseResponse']

const tones = { GREEN: 'success', YELLOW: 'warning', RED: 'danger' } as const

export function PatientDashboard() {
  const t = useTranslations()
  const patient = useApiQuery<Patient>(['patient', 'me', 'observable'], '/patients/me', {
    query: { only_observable: true },
  })
  const dispenses = useApiQuery<Dispense[]>(
    ['dispenses', 'me', 'observable'],
    '/device-dispenses/me',
    {
      query: { only_observable: true },
    },
  )
  const reports = useApiQuery<Report[]>(['reports', 'my'], '/reports/my')
  const unread = useApiQuery<unknown>(['chat', 'unread', 'patient'], '/chat/messages/unread')
  const status = patient.data?.status ?? 'GREEN'

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Qadam</p>
          <h1>
            {patient.data?.firstName
              ? t('dashboard.hello', { name: patient.data.firstName })
              : t('dashboard.patientTitle')}
          </h1>
        </div>
        <StatusBadge tone={tones[status]}>{t(`enums.${status}` as never)}</StatusBadge>
      </header>
      {patient.isError ? (
        <div className="form-alert" role="alert">
          {t('errors.generic')}
        </div>
      ) : null}
      <section className="dashboard-grid dashboard-grid--patient">
        <Card className="dashboard-action" eyebrow={t('common.today')} title={t('reports.new')}>
          <p>{t('landing.stepOne')}</p>
          <Link className="button button--primary" href="/patient/reports">
            {t('reports.new')} →
          </Link>
        </Card>
        <Card title={t('devices.title')}>
          <div className="metric-row">
            <PackageOpen />
            <strong>{dispenses.data?.length ?? '—'}</strong>
            <span>{patient.data?.currentDevices?.[0]?.deviceName ?? t('common.empty')}</span>
          </div>
        </Card>
        <Card title={t('reports.history')}>
          <div className="metric-row">
            <Activity />
            <strong>{reports.data?.length ?? '—'}</strong>
            <span>
              {reports.data?.[0]?.submittedAt
                ? new Intl.DateTimeFormat('ru-KZ').format(new Date(reports.data[0].submittedAt))
                : t('common.empty')}
            </span>
          </div>
        </Card>
        <Card title={t('patients.practitioner')}>
          <div className="metric-row">
            <UserRound />
            <strong className="metric-row__name">
              {patient.data?.practitionerFullName ?? '—'}
            </strong>
            <span>{patient.data?.phone ?? ''}</span>
          </div>
        </Card>
        <Card title={t('chat.title')}>
          <div className="metric-row">
            <MessageCircle />
            <strong>{typeof unread.data === 'number' ? unread.data : '—'}</strong>
            <Link href="/patient/chat">{t('common.open')}</Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
