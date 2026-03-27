import { describe, it, expect, vi } from 'vitest'
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

    it('demonstrates UTC date shift: toISOString() vs local date methods', () => {
      // ====================================================================
      // This test proves that formatDateToStringDate (which uses toISOString)
      // can return a DIFFERENT date than what the user sees locally.
      //
      // Real-world scenario:
      //   A user in Pacific Time (UTC-8) opens the Pay Schedule form
      //   at 5:00 PM on March 26. The component sets minDate={new Date()}.
      //   At 5 PM Pacific, UTC time is already March 27 at 1:00 AM.
      //
      //   formatDateToStringDate(new Date()) → "2024-03-27" (UTC, WRONG)
      //   getFullYear/getMonth/getDate      → "2024-03-26" (local, CORRECT)
      // ====================================================================

      vi.useFakeTimers()
      // Freeze time: March 27 at 1:00 AM UTC = March 26 at 5:00 PM Pacific
      vi.setSystemTime(new Date('2024-03-27T01:00:00.000Z'))

      const now = new Date()

      // Approach 1: formatDateToStringDate uses toISOString() → always UTC
      const utcBasedResult = formatDateToStringDate(now)
      expect(utcBasedResult).toBe('2024-03-27') // Always returns the UTC date

      // Approach 2: Local date extraction (what dateToCalendarDate now uses)
      const localBasedResult = [
        String(now.getFullYear()).padStart(4, '0'),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-')

      // On any machine west of UTC (all US timezones):
      //   localBasedResult = "2024-03-26" (user's actual local date)
      //   utcBasedResult   = "2024-03-27" (shifted forward one day!)
      //
      // On a machine in UTC: both return "2024-03-27" (no discrepancy)
      const offsetMinutes = now.getTimezoneOffset()
      if (offsetMinutes > 0) {
        // Machine is west of UTC (Americas) — the bug manifests
        expect(localBasedResult).toBe('2024-03-26')
        expect(utcBasedResult).not.toBe(localBasedResult)
      } else if (offsetMinutes === 0) {
        // Machine is in UTC — both agree (bug hidden but still latent)
        expect(localBasedResult).toBe('2024-03-27')
        expect(utcBasedResult).toBe(localBasedResult)
      } else {
        // Machine is east of UTC (Europe, Asia) — local date is even further ahead
        // At this UTC time, some eastern zones are already March 27 locally too
      }

      vi.useRealTimers()
    })

    it('shows formatDateToStringDate shifts midnight dates in eastern timezones', () => {
      // ====================================================================
      // The opposite edge case: in timezones EAST of UTC (Asia, Australia),
      // new Date(year, month, day) creates local midnight which is the
      // PREVIOUS day in UTC. formatDateToStringDate then returns yesterday.
      //
      // Example: UTC+9 (Tokyo)
      //   new Date(2024, 0, 15) = midnight Jan 15 JST = Jan 14 15:00 UTC
      //   toISOString() → "2024-01-14T15:00:00.000Z" → "2024-01-14" (WRONG)
      //   getDate() → 15 (CORRECT)
      // ====================================================================

      // Create midnight local on Jan 15 — this is the typical way form dates
      // are constructed (e.g., calendarDateValueToDate returns midnight local)
      const localMidnight = new Date(2024, 0, 15, 0, 0, 0)

      // The local date is always Jan 15 regardless of timezone
      const localDate = localMidnight.getDate()
      expect(localDate).toBe(15)

      // The UTC date depends on timezone
      const utcDate = localMidnight.getUTCDate()
      const offsetMinutes = localMidnight.getTimezoneOffset()

      if (offsetMinutes < 0) {
        // Machine is east of UTC — midnight local is BEFORE midnight UTC
        // So UTC date is the previous day (14 instead of 15)
        expect(utcDate).toBe(14)
        expect(formatDateToStringDate(localMidnight)).toBe('2024-01-14') // WRONG!
      } else if (offsetMinutes > 0) {
        // Machine is west of UTC — midnight local is AFTER midnight UTC
        // UTC date is same day
        expect(utcDate).toBe(15)
        expect(formatDateToStringDate(localMidnight)).toBe('2024-01-15') // Correct (by coincidence)
      } else {
        // UTC — always agrees
        expect(utcDate).toBe(15)
        expect(formatDateToStringDate(localMidnight)).toBe('2024-01-15')
      }
    })
  })

  describe('normalizeDateToLocal', () => {
    it('should normalize UTC dates to local midnight', () => {
      const utcDate = new Date('2023-12-25T00:00:00.000Z')
      const normalized = normalizeDateToLocal(utcDate)

      expect(normalized).toBeInstanceOf(Date)
      expect(normalized?.getFullYear()).toBe(2023)
      expect(normalized?.getMonth()).toBe(11)
      expect(normalized?.getDate()).toBe(25)
      expect(normalized?.getHours()).toBe(0)
      expect(normalized?.getMinutes()).toBe(0)
    })

    it('should normalize dates with time to midnight', () => {
      const dateWithTime = new Date('2024-03-15T15:30:45.000Z')
      const normalized = normalizeDateToLocal(dateWithTime)

      expect(normalized?.getFullYear()).toBe(2024)
      expect(normalized?.getMonth()).toBe(2)
      expect(normalized?.getDate()).toBe(15)
      expect(normalized?.getHours()).toBe(0)
    })

    it('should return null for invalid inputs', () => {
      expect(normalizeDateToLocal(null)).toBeNull()
      expect(normalizeDateToLocal(new Date('invalid'))).toBeNull()
      expect(normalizeDateToLocal(new Date(NaN))).toBeNull()
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
})
