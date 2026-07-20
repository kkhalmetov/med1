import type { Locale } from '@/shared/i18n/locale'

export type UserRole = 'PATIENT' | 'PRACTITIONER' | 'ADMIN'

export function canAccessRole(actual: UserRole, required: UserRole) {
  return actual === required
}

export function roleHome(role: UserRole, locale: Locale) {
  if (role === 'PATIENT') return `/${locale}/patient` as const
  if (role === 'PRACTITIONER') return `/${locale}/practitioner` as const
  return `/${locale}/admin` as const
}

export function isUserRole(value: string | undefined): value is UserRole {
  return value === 'PATIENT' || value === 'PRACTITIONER' || value === 'ADMIN'
}
