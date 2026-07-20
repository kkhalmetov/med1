import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { canAccessRole, isUserRole, roleHome, type UserRole } from '@/features/auth/session'
import { isLocale, type Locale } from '@/shared/i18n/locale'
import { sessionCookieNames } from './session'

export async function requireRole(localeValue: string, requiredRole: UserRole) {
  const locale: Locale = isLocale(localeValue) ? localeValue : 'ru'
  const jar = await cookies()
  const role = jar.get(sessionCookieNames.role)?.value
  const userId = jar.get(sessionCookieNames.userId)?.value
  const accessToken = jar.get(sessionCookieNames.access)?.value

  if (!isUserRole(role) || !userId || !accessToken) redirect(`/${locale}/login`)
  if (!canAccessRole(role, requiredRole)) redirect(roleHome(role, locale))
  return { role, userId }
}
