import { describe, expect, it } from 'vitest'
import kk from '../messages/kk.json'
import ru from '../messages/ru.json'
import { replaceLocaleInPath } from '@/shared/i18n/locale'

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

const backendEnumValues = [
  'ADMIN',
  'APPROVED',
  'ARM',
  'BACK',
  'BREAKAGE',
  'COMPLETED',
  'DISCOMFORT',
  'FEMALE',
  'FIRST',
  'GREEN',
  'IN_REVIEW',
  'LEG',
  'MALE',
  'NECK',
  'ORTHOSIS',
  'OTHER',
  'PATIENT',
  'PENDING',
  'PRACTITIONER',
  'PROSTHESIS',
  'RED',
  'REJECTED',
  'SECOND',
  'THIRD',
  'WEAR_AND_TEAR',
  'YELLOW',
]

describe('translation contract', () => {
  it('keeps Russian and Kazakh dictionary keys in parity', () => {
    expect(flattenKeys(kk).sort()).toEqual(flattenKeys(ru).sort())
  })

  it.each(backendEnumValues)('translates backend enum %s in both locales', (value) => {
    const ruEnums = ru.enums as Record<string, string>
    const kkEnums = kk.enums as Record<string, string>
    expect(ruEnums[value]).toBeTruthy()
    expect(kkEnums[value]).toBeTruthy()
  })

  it('changes only the locale segment of the current logical page', () => {
    expect(replaceLocaleInPath('/ru/patient/reports?day=today', 'kk')).toBe(
      '/kk/patient/reports?day=today',
    )
    expect(replaceLocaleInPath('/login', 'ru')).toBe('/ru/login')
  })
})
