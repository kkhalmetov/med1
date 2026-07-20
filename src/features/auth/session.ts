import type { Locale } from '@/shared/i18n/locale'

export type UserRole = 'PATIENT' | 'PRACTITIONER' | 'ADMIN'

export function canAccessRole(actual: UserRole, required: UserRole) {
  return actual === required
}

export function rolePath(role: UserRole) {
  if (role === 'PATIENT') return '/patient' as const
  if (role === 'PRACTITIONER') return '/practitioner' as const
  return '/admin' as const
}

export function roleHome(role: UserRole, locale: Locale) {
  return `/${locale}${rolePath(role)}` as const
}

export function isUserRole(value: string | undefined): value is UserRole {
  return value === 'PATIENT' || value === 'PRACTITIONER' || value === 'ADMIN'
}
