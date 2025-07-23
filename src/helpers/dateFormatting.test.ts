import { describe, it, expect } from 'vitest'
import { parseDateStringToLocal, formatDateToStringDate } from './dateFormatting'

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

  it('should round-trip correctly with formatDateToStringDate', () => {
    const originalString = '2023-03-10'
    const date = parseDateStringToLocal(originalString)
    const roundTripString = formatDateToStringDate(date!)

    expect(roundTripString).toBe(originalString)
  })

  it('should return null for invalid inputs', () => {
    expect(parseDateStringToLocal('')).toBeNull()
    expect(parseDateStringToLocal('invalid')).toBeNull()
    expect(parseDateStringToLocal('2023-13-01')).toBeNull() // Invalid month
    expect(parseDateStringToLocal('2023-12-32')).toBeNull() // Invalid day
  })
})
