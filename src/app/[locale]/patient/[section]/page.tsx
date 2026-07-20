import { notFound } from 'next/navigation'
import { PatientWorkspace } from '@/features/patient/patient-workspace'

const sections = ['reports', 'devices', 'complaints', 'chat', 'profile'] as const

export default async function PatientSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!sections.includes(section as (typeof sections)[number])) notFound()
  return <PatientWorkspace section={section as (typeof sections)[number]} />
}
