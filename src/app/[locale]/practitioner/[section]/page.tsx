import { notFound } from 'next/navigation'
import { PractitionerWorkspace } from '@/features/practitioner/practitioner-workspace'

const sections = ['patients', 'reports', 'complaints', 'chat', 'devices', 'profile'] as const

export default async function PractitionerSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!sections.includes(section as (typeof sections)[number])) notFound()
  return <PractitionerWorkspace section={section as (typeof sections)[number]} />
}
