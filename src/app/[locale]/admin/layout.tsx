import type { ReactNode } from 'react'
import { requireRole } from '@/server/auth/guard'
import { AppShell } from '@/shared/ui/app-shell'

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireRole(locale, 'ADMIN')
  return <AppShell role="ADMIN">{children}</AppShell>
}
