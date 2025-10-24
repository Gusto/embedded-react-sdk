import { describe, it, expect } from 'vitest'
import {
  parseDateStringToLocal,
  normalizeDateToLocal,
  formatDateForBreadcrumb,
} from './dateFormatting'

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

describe('formatDateForBreadcrumb', () => {
  it('should format valid date string using locale', () => {
    const result = formatDateForBreadcrumb('2023-12-25', 'en-US')
    expect(result).toBeTruthy()
    expect(result).toContain('Dec')
    expect(result).toContain('25')
    expect(result).toContain('2023')
  })

  it('should return empty string for undefined', () => {
    expect(formatDateForBreadcrumb(undefined, 'en-US')).toBe('')
  })

  it('should return empty string for invalid date strings', () => {
    expect(formatDateForBreadcrumb('', 'en-US')).toBe('')
    expect(formatDateForBreadcrumb('invalid', 'en-US')).toBe('')
    expect(formatDateForBreadcrumb('2023-13-01', 'en-US')).toBe('')
  })

  it('should format dates correctly for different locales', () => {
    const dateString = '2023-12-25'

    const usFormat = formatDateForBreadcrumb(dateString, 'en-US')
    expect(usFormat).toBeTruthy()
    expect(usFormat).toContain('Dec')

    const ukFormat = formatDateForBreadcrumb(dateString, 'en-GB')
    expect(ukFormat).toBeTruthy()
    expect(ukFormat).toContain('Dec')
  })
})
