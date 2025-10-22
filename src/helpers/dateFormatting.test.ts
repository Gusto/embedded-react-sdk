import { describe, it, expect } from 'vitest'
import {
  parseDateStringToLocal,
  normalizeDateToLocal,
  formatDateTimeWithTimezone,
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

describe('formatDateTimeWithTimezone', () => {
  it('should format a Date object with time, timezone, and date', () => {
    const date = new Date('2025-09-08T23:00:00.000Z')
    const result = formatDateTimeWithTimezone(date)

    expect(result.time).toBeTruthy()
    expect(result.date).toBeTruthy()
    expect(result.time).toContain('M')
    expect(result.time).toMatch(/\d{1,2}:\d{2}/)
  })

  it('should format a date string with time, timezone, and date', () => {
    const dateString = 'Mon Sep 08 2025 16:00:00 GMT-0700'
    const result = formatDateTimeWithTimezone(dateString)

    expect(result.time).toBeTruthy()
    expect(result.date).toBeTruthy()
    expect(result.time).toContain('M')
    expect(result.time).toMatch(/\d{1,2}:\d{2}/)
  })

  it('should return empty strings for undefined input', () => {
    const result = formatDateTimeWithTimezone(undefined)
    expect(result.time).toBe('')
    expect(result.date).toBe('')
  })

  it('should return empty strings for invalid date string', () => {
    const result = formatDateTimeWithTimezone('invalid-date')
    expect(result.time).toBe('')
    expect(result.date).toBe('')
  })

  it('should include AM or PM in the time output', () => {
    const morningDate = new Date('2025-09-08T14:00:00.000Z')
    const eveningDate = new Date('2025-09-08T23:00:00.000Z')

    const morningResult = formatDateTimeWithTimezone(morningDate)
    const eveningResult = formatDateTimeWithTimezone(eveningDate)

    expect(morningResult.time).toMatch(/AM|PM/)
    expect(eveningResult.time).toMatch(/AM|PM/)
  })

  it('should include timezone abbreviation in the time output', () => {
    const date = new Date('2025-09-08T23:00:00.000Z')
    const result = formatDateTimeWithTimezone(date)

    expect(result.time).toMatch(/\b[A-Z]{2,5}\b/)
  })

  it('should format with custom locale when provided', () => {
    const date = new Date('2025-09-08T23:00:00.000Z')
    const resultUS = formatDateTimeWithTimezone(date, 'en-US')

    expect(resultUS.time).toBeTruthy()
    expect(resultUS.date).toBeTruthy()
  })
})
