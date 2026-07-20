import { notFound } from 'next/navigation'
import { AdminWorkspace } from '@/features/admin/admin-workspace'

const sections = [
  'qualifications',
  'organizations',
  'practitioners',
  'devices',
  'dispenses',
  'profile',
] as const

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!sections.includes(section as (typeof sections)[number])) notFound()
  return <AdminWorkspace section={section as (typeof sections)[number]} />
}
