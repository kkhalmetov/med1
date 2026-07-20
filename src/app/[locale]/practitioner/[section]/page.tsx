import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { operationGroups } from '@/shared/api/operation-catalog'
import { getOperationDefinitions } from '@/server/backend/form-contract'
import { WorkspacePage } from '@/shared/ui/workspace-page'

const sections = {
  patients: ['practitionerPatients', 'patients.title'],
  reports: ['practitionerReports', 'reports.title'],
  complaints: ['practitionerComplaints', 'complaints.title'],
  chat: ['practitionerChat', 'chat.title'],
  devices: ['practitionerDevices', 'devices.title'],
  profile: ['practitionerProfile', 'profile.title'],
} as const

export default async function PractitionerSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!(section in sections)) notFound()
  const [group, titleKey] = sections[section as keyof typeof sections]
  const t = await getTranslations()
  return (
    <WorkspacePage
      definitions={getOperationDefinitions(operationGroups[group])}
      eyebrow="Qadam"
      includePassword={section === 'profile'}
      title={t(titleKey)}
    />
  )
}
