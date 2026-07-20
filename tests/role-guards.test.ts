import { describe, expect, it } from 'vitest'
import { canAccessRole, roleHome, rolePath } from '@/features/auth/session'

describe('role guards', () => {
  it.each([
    ['PATIENT', 'PATIENT', true],
    ['PATIENT', 'PRACTITIONER', false],
    ['PRACTITIONER', 'PRACTITIONER', true],
    ['PRACTITIONER', 'ADMIN', false],
    ['ADMIN', 'ADMIN', true],
    ['ADMIN', 'PATIENT', false],
  ] as const)('checks %s session against %s area', (actual, required, allowed) => {
    expect(canAccessRole(actual, required)).toBe(allowed)
  })

  it('maps each role to a localized home without leaking another area', () => {
    expect(rolePath('PATIENT')).toBe('/patient')
    expect(rolePath('PRACTITIONER')).toBe('/practitioner')
    expect(rolePath('ADMIN')).toBe('/admin')
    expect(roleHome('PATIENT', 'ru')).toBe('/ru/patient')
    expect(roleHome('PRACTITIONER', 'kk')).toBe('/kk/practitioner')
    expect(roleHome('ADMIN', 'ru')).toBe('/ru/admin')
  })
})
