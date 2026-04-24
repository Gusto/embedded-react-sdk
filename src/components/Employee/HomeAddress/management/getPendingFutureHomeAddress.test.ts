import { describe, expect, it } from 'vitest'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  formatPendingHomeAddressLine,
  getPendingFutureHomeAddress,
} from './getPendingFutureHomeAddress'

const base = (overrides: Partial<EmployeeAddress>): EmployeeAddress => ({
  active: false,
  uuid: 'u',
  employeeUuid: 'e',
  street1: '1 Main',
  version: 'v',
  country: 'USA',
  ...overrides,
})

describe('getPendingFutureHomeAddress', () => {
  it('returns undefined when there are no addresses', () => {
    expect(getPendingFutureHomeAddress(undefined)).toBeUndefined()
    expect(getPendingFutureHomeAddress([])).toBeUndefined()
  })

  it('returns the earliest future inactive address', () => {
    const now = new Date('2026-03-15T12:00:00')
    const past = base({
      uuid: '1',
      active: false,
      effectiveDate: new RFCDate('2026-01-01'),
    })
    const futureA = base({
      uuid: '2',
      active: false,
      effectiveDate: new RFCDate('2026-04-24'),
    })
    const futureB = base({
      uuid: '3',
      active: false,
      effectiveDate: new RFCDate('2026-06-01'),
    })
    const active = base({
      uuid: '4',
      active: true,
      effectiveDate: new RFCDate('2026-03-02'),
    })

    expect(getPendingFutureHomeAddress([past, futureB, futureA, active], now)).toEqual(futureA)
  })

  it('ignores inactive addresses with effective date in the past or today', () => {
    const now = new Date('2026-03-15T12:00:00')
    const past = base({
      uuid: '1',
      active: false,
      effectiveDate: new RFCDate('2026-03-10'),
    })
    const today = base({
      uuid: '2',
      active: false,
      effectiveDate: new RFCDate('2026-03-15'),
    })

    expect(getPendingFutureHomeAddress([past, today], now)).toBeUndefined()
  })
})

describe('formatPendingHomeAddressLine', () => {
  it('formats street, locality, and United States for USA', () => {
    const line = formatPendingHomeAddressLine(
      base({
        street1: '1815 John F Kennedy Blvd',
        street2: 'Apt 1604',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19103',
        country: 'USA',
      }),
    )
    expect(line).toBe('1815 John F Kennedy Blvd, Apt 1604, Philadelphia, PA 19103, United States')
  })
})
