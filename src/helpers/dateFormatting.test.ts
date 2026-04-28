import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  formatDateShortWithWeekday,
  formatDateShortWithWeekdayAndYear,
  formatDateShort,
  formatDateShortWithYear,
  formatDateLong,
  formatDateLongWithYear,
  formatDateWithTime,
  formatPayPeriod,
  formatPayPeriodRange,
  formatDateToStringDate,
  normalizeDateToLocal,
  normalizeToISOString,
  addBusinessDays,
} from './dateFormatting'

describe('Date Formatting Helpers', () => {
  const locale = 'en-US'

  describe('formatDateShort', () => {
    it('should format date with short month and day only', () => {
      expect(formatDateShort('2024-01-15', locale)).toBe('Jan 15')
    })

    it('should handle Date objects', () => {
      expect(formatDateShort(new Date(2024, 0, 15), locale)).toBe('Jan 15')
    })

    it('should return empty string for null/undefined', () => {
      expect(formatDateShort(null, locale)).toBe('')
      expect(formatDateShort(undefined, locale)).toBe('')
    })
  })

  describe('formatDateShortWithYear', () => {
    it('should format date with short month, day, and year', () => {
      expect(formatDateShortWithYear('2024-01-15', locale)).toBe('Jan 15, 2024')
    })

    it('should handle Date objects', () => {
      expect(formatDateShortWithYear(new Date(2024, 0, 15), locale)).toBe('Jan 15, 2024')
    })
  })

  describe('formatDateLong', () => {
    it('should format date with long month and day only', () => {
      expect(formatDateLong('2024-01-15', locale)).toBe('January 15')
    })

    it('should handle Date objects', () => {
      expect(formatDateLong(new Date(2024, 0, 15), locale)).toBe('January 15')
    })
  })

  describe('formatDateLongWithYear', () => {
    it('should format date with long month, day, and year', () => {
      expect(formatDateLongWithYear('2024-01-15', locale)).toBe('January 15, 2024')
    })

    it('should handle Date objects', () => {
      expect(formatDateLongWithYear(new Date(2024, 0, 15), locale)).toBe('January 15, 2024')
    })
  })

  describe('formatDateShortWithWeekday', () => {
    it('should format date with weekday and short month', () => {
      expect(formatDateShortWithWeekday('2024-01-15', locale)).toBe('Mon, Jan 15')
    })

    it('should handle Date objects', () => {
      expect(formatDateShortWithWeekday(new Date(2024, 0, 15), locale)).toBe('Mon, Jan 15')
    })

    it('should return empty string for invalid dates', () => {
      expect(formatDateShortWithWeekday('invalid', locale)).toBe('')
      expect(formatDateShortWithWeekday(null, locale)).toBe('')
    })
  })

  describe('formatDateShortWithWeekdayAndYear', () => {
    it('should format date with weekday, short month, and year', () => {
      expect(formatDateShortWithWeekdayAndYear('2024-01-15', locale)).toBe('Mon, Jan 15, 2024')
    })

    it('should handle Date objects', () => {
      expect(formatDateShortWithWeekdayAndYear(new Date(2024, 0, 15), locale)).toBe(
        'Mon, Jan 15, 2024',
      )
    })
  })

  describe('formatDateWithTime', () => {
    it('should format Date object with time and date', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      const result = formatDateWithTime(date, locale)

      expect(result).toEqual({
        time: expect.stringMatching(/\d{1,2}:\d{2}\s?(AM|PM)\s\w+/),
        date: expect.stringMatching(/Mon.*Jan.*15/),
      })
    })

    it('should handle ISO timestamp strings', () => {
      const result = formatDateWithTime('2024-01-15T14:30:00.000Z', locale)

      expect(result.time).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/)
      expect(result.date).toMatch(/Mon.*Jan.*15/)
    })

    it('should return empty strings for null/undefined', () => {
      expect(formatDateWithTime(null, locale)).toEqual({ time: '', date: '' })
      expect(formatDateWithTime(undefined, locale)).toEqual({ time: '', date: '' })
      expect(formatDateWithTime('invalid', locale)).toEqual({ time: '', date: '' })
    })
  })

  describe('formatPayPeriod', () => {
    it('should format with long start month and short end month with year', () => {
      expect(formatPayPeriod('2024-01-01', '2024-01-15', locale)).toEqual({
        startDate: 'January 1',
        endDate: 'Jan 15, 2024',
      })
    })

    it('should handle cross-month periods', () => {
      expect(formatPayPeriod('2024-01-16', '2024-01-31', locale)).toEqual({
        startDate: 'January 16',
        endDate: 'Jan 31, 2024',
      })
    })

    it('should handle Date objects', () => {
      const start = new Date(2024, 0, 1)
      const end = new Date(2024, 0, 15)

      expect(formatPayPeriod(start, end, locale)).toEqual({
        startDate: 'January 1',
        endDate: 'Jan 15, 2024',
      })
    })

    it('should return empty strings when either date is missing', () => {
      expect(formatPayPeriod(null, '2024-01-15', locale)).toEqual({ startDate: '', endDate: '' })
      expect(formatPayPeriod('2024-01-01', null, locale)).toEqual({ startDate: '', endDate: '' })
      expect(formatPayPeriod(null, null, locale)).toEqual({ startDate: '', endDate: '' })
    })
  })

  describe('formatPayPeriodRange', () => {
    it('should format with long months by default', () => {
      expect(formatPayPeriodRange('2024-01-01', '2024-01-15', locale)).toBe(
        'January 1–January 15, 2024',
      )
    })

    it('should format with short months when option is set', () => {
      expect(
        formatPayPeriodRange('2024-01-01', '2024-01-15', locale, { useShortMonth: true }),
      ).toBe('Jan 1–Jan 15, 2024')
    })

    it('should handle cross-month ranges', () => {
      expect(formatPayPeriodRange('2023-12-16', '2024-01-15', locale)).toBe(
        'December 16–January 15, 2024',
      )
    })

    it('should handle Date objects', () => {
      const start = new Date(2024, 0, 1)
      const end = new Date(2024, 0, 15)

      expect(formatPayPeriodRange(start, end, locale)).toBe('January 1–January 15, 2024')
    })

    it('should return empty string when either date is missing', () => {
      expect(formatPayPeriodRange(null, '2024-01-15', locale)).toBe('')
      expect(formatPayPeriodRange('2024-01-01', null, locale)).toBe('')
      expect(formatPayPeriodRange(null, null, locale)).toBe('')
    })
  })

  describe('formatDateToStringDate', () => {
    it('should convert Date to YYYY-MM-DD format', () => {
      expect(formatDateToStringDate(new Date(2024, 0, 15))).toBe('2024-01-15')
      expect(formatDateToStringDate(new Date(2023, 11, 31))).toBe('2023-12-31')
      expect(formatDateToStringDate(new Date(2024, 0, 1))).toBe('2024-01-01')
    })

    it('should return null for invalid dates', () => {
      expect(formatDateToStringDate(new Date('invalid'))).toBeNull()
      expect(formatDateToStringDate(new Date(NaN))).toBeNull()
    })
  })

  describe('normalizeDateToLocal', () => {
    it('returns a Date at local midnight reflecting the input\u2019s local calendar date', () => {
      // Constructed in local time so the assertion is timezone-deterministic.
      const localDate = new Date(2023, 11, 25)
      const normalized = normalizeDateToLocal(localDate)

      expect(normalized).toBeInstanceOf(Date)
      expect(normalized?.getFullYear()).toBe(2023)
      expect(normalized?.getMonth()).toBe(11)
      expect(normalized?.getDate()).toBe(25)
      expect(normalized?.getHours()).toBe(0)
      expect(normalized?.getMinutes()).toBe(0)
    })

    it('zeros the time component while preserving the local calendar date', () => {
      const dateWithTime = new Date(2024, 2, 15, 15, 30, 45)
      const normalized = normalizeDateToLocal(dateWithTime)

      expect(normalized?.getFullYear()).toBe(2024)
      expect(normalized?.getMonth()).toBe(2)
      expect(normalized?.getDate()).toBe(15)
      expect(normalized?.getHours()).toBe(0)
      expect(normalized?.getMinutes()).toBe(0)
      expect(normalized?.getSeconds()).toBe(0)
    })

    it('should return null for invalid inputs', () => {
      expect(normalizeDateToLocal(null)).toBeNull()
      expect(normalizeDateToLocal(new Date('invalid'))).toBeNull()
      expect(normalizeDateToLocal(new Date(NaN))).toBeNull()
    })
  })

  describe.each([
    { tz: 'UTC', label: 'UTC' },
    { tz: 'America/Los_Angeles', label: 'UTC-8 (PST)' },
    { tz: 'Asia/Kolkata', label: 'UTC+5:30 (IST)' },
    { tz: 'Pacific/Kiritimati', label: 'UTC+14' },
  ])('timezone behavior in $label', ({ tz }) => {
    const originalTZ = process.env.TZ

    beforeAll(() => {
      process.env.TZ = tz
    })

    afterAll(() => {
      process.env.TZ = originalTZ
    })

    describe('formatDateToStringDate', () => {
      it('returns the local calendar date for a local-midnight Date', () => {
        // `new Date(year, month, day)` creates a Date at LOCAL midnight regardless
        // of host timezone. The formatter must return the same calendar date the
        // user constructed, not the date's UTC interpretation.
        expect(formatDateToStringDate(new Date(2024, 0, 15))).toBe('2024-01-15')
      })

      it('returns the local calendar date for a Date with an explicit time component', () => {
        // 11:30 PM local on Jan 15 — in UTC- timezones this maps to a UTC instant
        // on Jan 16, so any UTC-based formatter would emit the wrong calendar date.
        expect(formatDateToStringDate(new Date(2024, 0, 15, 23, 30))).toBe('2024-01-15')
      })

      it('returns the local calendar date for an early-morning Date', () => {
        // 1:00 AM local on Jan 16 — in UTC+ timezones this maps to a UTC instant
        // on Jan 15, so any UTC-based formatter would emit the wrong calendar date.
        expect(formatDateToStringDate(new Date(2024, 0, 16, 1, 0))).toBe('2024-01-16')
      })
    })

    describe('normalizeDateToLocal', () => {
      it('returns the same calendar date for a local-midnight Date (no-op)', () => {
        const localMidnight = new Date(2024, 0, 15)
        const normalized = normalizeDateToLocal(localMidnight)
        expect(normalized?.getFullYear()).toBe(2024)
        expect(normalized?.getMonth()).toBe(0)
        expect(normalized?.getDate()).toBe(15)
        expect(normalized?.getHours()).toBe(0)
      })

      it('zeros the time component while preserving the local calendar date', () => {
        const lateAfternoon = new Date(2024, 0, 15, 17, 30, 45)
        const normalized = normalizeDateToLocal(lateAfternoon)
        expect(normalized?.getFullYear()).toBe(2024)
        expect(normalized?.getMonth()).toBe(0)
        expect(normalized?.getDate()).toBe(15)
        expect(normalized?.getHours()).toBe(0)
        expect(normalized?.getMinutes()).toBe(0)
        expect(normalized?.getSeconds()).toBe(0)
      })
    })

    describe('round trip: normalizeDateToLocal -> formatDateToStringDate', () => {
      it('preserves the user-picked calendar date', () => {
        // This mirrors what DatePickerField does in string mode: the underlying
        // adapter (react-aria) hands us a local-midnight Date for the day the
        // user clicked, and we round-trip through these two helpers to produce
        // the YYYY-MM-DD string stored in the form. The picked date must survive.
        const pickedDate = new Date(2024, 3, 16) // April 16 local midnight
        const normalized = normalizeDateToLocal(pickedDate)
        const stringForm = normalized ? formatDateToStringDate(normalized) : null
        expect(stringForm).toBe('2024-04-16')
      })
    })
  })

  describe('Edge cases and input validation', () => {
    it('should handle leap year dates', () => {
      expect(formatDateShort('2024-02-29', locale)).toBe('Feb 29')
    })

    it('should handle year boundaries', () => {
      expect(formatDateShort('2023-12-31', locale)).toBe('Dec 31')
      expect(formatDateShort('2024-01-01', locale)).toBe('Jan 1')
    })

    it('should handle single-digit days consistently', () => {
      expect(formatDateShort('2024-01-01', locale)).toBe('Jan 1')
      expect(formatDateShort('2024-01-09', locale)).toBe('Jan 9')
    })

    it('should handle all months correctly', () => {
      expect(formatDateLong('2024-01-15', locale)).toBe('January 15')
      expect(formatDateLong('2024-02-15', locale)).toBe('February 15')
      expect(formatDateLong('2024-03-15', locale)).toBe('March 15')
      expect(formatDateLong('2024-12-15', locale)).toBe('December 15')
    })

    it('should consistently handle mixed input types for same date', () => {
      const dateString = '2024-06-15'
      const dateObject = new Date(2024, 5, 15)

      expect(formatDateShort(dateString, locale)).toBe(formatDateShort(dateObject, locale))
      expect(formatDateLong(dateString, locale)).toBe(formatDateLong(dateObject, locale))
      expect(formatDateShortWithWeekday(dateString, locale)).toBe(
        formatDateShortWithWeekday(dateObject, locale),
      )
    })
  })

  describe('normalizeToISOString', () => {
    it('returns an ISO string as-is', () => {
      expect(normalizeToISOString('1998-04-16')).toBe('1998-04-16')
    })

    it('converts a locale M/D/YYYY string to YYYY-MM-DD', () => {
      expect(normalizeToISOString('4/16/1998')).toBe('1998-04-16')
    })

    it('converts a locale MM/DD/YYYY string to YYYY-MM-DD', () => {
      expect(normalizeToISOString('04/16/1998')).toBe('1998-04-16')
    })

    it('converts a long-form date string to YYYY-MM-DD', () => {
      expect(normalizeToISOString('April 16, 1998')).toBe('1998-04-16')
    })

    it('returns empty string for null', () => {
      expect(normalizeToISOString(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(normalizeToISOString(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(normalizeToISOString('')).toBe('')
    })

    it('returns empty string for an unparseable string', () => {
      expect(normalizeToISOString('not-a-date')).toBe('')
    })

    it('handles leap year dates', () => {
      expect(normalizeToISOString('2/29/2000')).toBe('2000-02-29')
    })

    it('handles year boundary Dec 31', () => {
      expect(normalizeToISOString('12/31/2023')).toBe('2023-12-31')
    })

    it('handles year boundary Jan 1', () => {
      expect(normalizeToISOString('1/1/2024')).toBe('2024-01-01')
    })
  })

  describe('addBusinessDays', () => {
    it('should add business days within the same week', () => {
      const monday = new Date(2024, 0, 8)
      const result = addBusinessDays(monday, 2)
      expect(result.getDay()).toBe(3)
      expect(result.getDate()).toBe(10)
    })

    it('should skip weekends when adding business days', () => {
      const friday = new Date(2024, 0, 5)
      const result = addBusinessDays(friday, 1)
      expect(result.getDay()).toBe(1)
      expect(result.getDate()).toBe(8)
    })

    it('should handle spanning multiple weekends', () => {
      const monday = new Date(2024, 0, 8)
      const result = addBusinessDays(monday, 7)
      expect(result.getDay()).toBe(3)
      expect(result.getDate()).toBe(17)
    })

    it('should return the same date when adding 0 business days', () => {
      const wednesday = new Date(2024, 0, 10)
      const result = addBusinessDays(wednesday, 0)
      expect(result.getDate()).toBe(10)
    })

    it('should add 4 business days correctly from Thursday', () => {
      const thursday = new Date(2024, 0, 11)
      const result = addBusinessDays(thursday, 4)
      expect(result.getDay()).toBe(3)
      expect(result.getDate()).toBe(17)
    })

    it('should handle starting on a weekend', () => {
      const saturday = new Date(2024, 0, 6)
      const result = addBusinessDays(saturday, 1)
      expect(result.getDay()).toBe(1)
      expect(result.getDate()).toBe(8)
    })
  })
})
