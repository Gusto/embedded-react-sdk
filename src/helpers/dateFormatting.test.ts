import { describe, it, expect } from 'vitest'
import { parseDateStringToLocal, normalizeDateToLocal } from './dateFormatting'

describe('parseDateStringToLocal', () => {
  it('should parse valid YYYY-MM-DD date strings correctly in local timezone', () => {
    const result = parseDateStringToLocal('2023-12-25')
    expect(result).toBeInstanceOf(Date)
    expect(result?.getFullYear()).toBe(2023)
    expect(result?.getMonth()).toBe(11) // December (0-indexed)
    expect(result?.getDate()).toBe(25)
    // Should be exactly midnight local time
    expect(result?.getHours()).toBe(0)
    expect(result?.getMinutes()).toBe(0)
    expect(result?.getSeconds()).toBe(0)
  })

  it('should return null for invalid inputs', () => {
    expect(parseDateStringToLocal('')).toBeNull()
    expect(parseDateStringToLocal('invalid')).toBeNull()
    expect(parseDateStringToLocal('2023-13-01')).toBeNull() // Invalid month
  })
})

describe('normalizeDateToLocal', () => {
  it('should normalize timezone-shifted dates', () => {
    // Simulate a date created by `new Date('2023-12-25')` which creates UTC midnight
    const problematicDate = new Date('2023-12-25')

    const normalized = normalizeDateToLocal(problematicDate)

    expect(normalized).toBeInstanceOf(Date)
    expect(normalized?.getFullYear()).toBe(2023)
    expect(normalized?.getMonth()).toBe(11) // December (0-indexed)
    expect(normalized?.getDate()).toBe(25)
    expect(normalized?.getHours()).toBe(0)
  })

  it('should handle null and invalid dates', () => {
    expect(normalizeDateToLocal(null)).toBeNull()
    expect(normalizeDateToLocal(new Date('invalid-date'))).toBeNull()
  })
})
