import { describe, expect, it } from 'vitest'
import type { CompanySuspension } from '@gusto/embedded-api/models/components/companysuspension'
import { getLatestSuspension } from './getLatestSuspension'

describe('getLatestSuspension', () => {
  it('returns undefined for an empty or missing list', () => {
    expect(getLatestSuspension(undefined)).toBeUndefined()
    expect(getLatestSuspension([])).toBeUndefined()
  })

  it('returns the suspension with the latest effective date', () => {
    const suspensions: CompanySuspension[] = [
      { uuid: 'older', effectiveDate: '2025-01-01' },
      { uuid: 'newest', effectiveDate: '2026-05-15' },
      { uuid: 'middle', effectiveDate: '2025-12-31' },
    ]
    expect(getLatestSuspension(suspensions)).toMatchObject({ uuid: 'newest' })
  })

  it('prefers a suspension with a date over one without', () => {
    const suspensions: CompanySuspension[] = [
      { uuid: 'no-date' },
      { uuid: 'with-date', effectiveDate: '2024-06-01' },
    ]
    expect(getLatestSuspension(suspensions)).toMatchObject({ uuid: 'with-date' })
  })
})
