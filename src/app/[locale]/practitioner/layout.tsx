import type { ReactNode } from 'react'
import { requireRole } from '@/server/auth/guard'
import { AppShell } from '@/shared/ui/app-shell'

export default async function PractitionerLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(locale, 'PRACTITIONER')
  return <AppShell role="PRACTITIONER">{children}</AppShell>
}
