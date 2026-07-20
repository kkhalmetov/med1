import type { ReactNode } from 'react'
import { requireRole } from '@/server/auth/guard'
import { AppShell } from '@/shared/ui/app-shell'

export default async function PatientLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(locale, 'PATIENT')
  return <AppShell role="PATIENT">{children}</AppShell>
}
