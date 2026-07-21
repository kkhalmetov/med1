import { describe, expect, it } from 'vitest'
import { isSameLocalDay } from '@/features/reports/report-day'

describe('isSameLocalDay', () => {
  it('matches timestamps from the same local calendar day', () => {
    expect(isSameLocalDay('2026-07-21T00:01:00', new Date('2026-07-21T23:59:00'))).toBe(true)
  })

  it('rejects timestamps from another or invalid day', () => {
    const now = new Date('2026-07-21T12:00:00')

    expect(isSameLocalDay('2026-07-20T23:59:00', now)).toBe(false)
    expect(isSameLocalDay(undefined, now)).toBe(false)
    expect(isSameLocalDay('not-a-date', now)).toBe(false)
  })
})
