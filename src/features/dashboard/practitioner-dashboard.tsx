'use client'

import { useTranslations } from 'next-intl'
import type { components } from '@/shared/api/schema'
import { useApiQuery } from '@/shared/api/use-api-query'
import { Card } from '@/shared/ui/card'
import { StatusBadge } from '@/shared/ui/status-badge'

type Patient = components['schemas']['PatientResponse']
type Report = components['schemas']['QuestionnaireResponseResponse']
type Complaint = components['schemas']['DeviceComplainResponse']

export function PractitionerDashboard() {
  const t = useTranslations()
  const patients = useApiQuery<Patient[]>(['patients', 'observable'], '/patients', {
    query: { only_observable: true },
  })
  const reports = useApiQuery<Report[]>(['reports', 'unchecked'], '/reports', {
    query: { is_unchecked: true },
  })
  const complaints = useApiQuery<Complaint[]>(['complaints', 'unreviewed'], '/device-complains', {
    query: { not_reviewed: true },
  })
  const unread = useApiQuery<unknown>(['chat', 'unread', 'practitioner'], '/chat/unread')
  const red = patients.data?.filter(({ status }) => status === 'RED').length ?? 0
  const stats = [
    [t('dashboard.attention'), red, 'danger'],
    [t('dashboard.uncheckedReports'), reports.data?.length ?? 0, 'warning'],
    [t('dashboard.newComplaints'), complaints.data?.length ?? 0, 'info'],
    [t('dashboard.unreadMessages'), Array.isArray(unread.data) ? unread.data.length : 0, 'neutral'],
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
        <div className="attention-list">
          {patients.data?.length ? (
            [...patients.data]
              .sort(
                (a, b) =>
                  ['RED', 'YELLOW', 'GREEN'].indexOf(a.status ?? 'GREEN') -
                  ['RED', 'YELLOW', 'GREEN'].indexOf(b.status ?? 'GREEN'),
              )
              .slice(0, 6)
              .map((patient) => (
                <div key={patient.id}>
                  <StatusBadge
                    tone={
                      patient.status === 'RED'
                        ? 'danger'
                        : patient.status === 'YELLOW'
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {t(`enums.${patient.status ?? 'GREEN'}` as never)}
                  </StatusBadge>
                  <strong>
                    {patient.lastName} {patient.firstName}
                  </strong>
                </div>
              ))
          ) : (
            <div className="empty-state">
              {patients.isLoading ? t('common.loading') : t('common.empty')}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
