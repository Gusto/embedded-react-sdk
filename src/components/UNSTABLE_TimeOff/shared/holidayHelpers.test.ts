import { describe, expect, it } from 'vitest'
import {
  getNextObservationDate,
  getDefaultHolidayItems,
  buildFederalHolidaysPayload,
  FEDERAL_HOLIDAYS,
  FEDERAL_HOLIDAY_KEYS,
} from './holidayHelpers'

describe('FEDERAL_HOLIDAYS', () => {
  it('contains 11 holidays', () => {
    expect(FEDERAL_HOLIDAYS).toHaveLength(11)
  })

  it('keys match expected holiday identifiers', () => {
    expect(FEDERAL_HOLIDAY_KEYS).toEqual([
      'newYearsDay',
      'mlkDay',
      'presidentsDay',
      'memorialDay',
      'juneteenth',
      'independenceDay',
      'laborDay',
      'columbusDay',
      'veteransDay',
      'thanksgiving',
      'christmasDay',
    ])
  })
})

describe('getNextObservationDate', () => {
  describe('fixed-date holidays', () => {
    it('returns this year date when holiday has not passed', () => {
      const ref = new Date(2026, 0, 1) // Jan 1
      const result = getNextObservationDate('juneteenth', ref)
      expect(result).toEqual(new Date(2026, 5, 19))
    })

    it('returns next year date when holiday has passed', () => {
      const ref = new Date(2026, 6, 5) // Jul 5
      const result = getNextObservationDate('independenceDay', ref)
      expect(result).toEqual(new Date(2027, 6, 4))
    })

    it('returns same-day when reference is the holiday', () => {
      const ref = new Date(2026, 11, 25) // Dec 25
      const result = getNextObservationDate('christmasDay', ref)
      expect(result).toEqual(new Date(2026, 11, 25))
    })

    it("returns Jan 1 of next year when New Year's has passed", () => {
      const ref = new Date(2026, 0, 2) // Jan 2
      const result = getNextObservationDate('newYearsDay', ref)
      expect(result).toEqual(new Date(2027, 0, 1))
    })
  })

  describe('Nth weekday holidays', () => {
    it('computes MLK Day (3rd Monday in January)', () => {
      const ref = new Date(2026, 0, 1)
      const result = getNextObservationDate('mlkDay', ref)
      // 2026: Jan 1 is Thursday. 1st Monday = Jan 5. 3rd Monday = Jan 19
      expect(result).toEqual(new Date(2026, 0, 19))
    })

    it("computes Presidents' Day (3rd Monday in February)", () => {
      const ref = new Date(2026, 0, 1)
      const result = getNextObservationDate('presidentsDay', ref)
      // 2026: Feb 1 is Sunday. 1st Monday = Feb 2. 3rd Monday = Feb 16
      expect(result).toEqual(new Date(2026, 1, 16))
    })

    it('computes Labor Day (1st Monday in September)', () => {
      const ref = new Date(2026, 0, 1)
      const result = getNextObservationDate('laborDay', ref)
      // 2026: Sep 1 is Tuesday. 1st Monday = Sep 7
      expect(result).toEqual(new Date(2026, 8, 7))
    })

    it('computes Columbus Day (2nd Monday in October)', () => {
      const ref = new Date(2026, 0, 1)
      const result = getNextObservationDate('columbusDay', ref)
      // 2026: Oct 1 is Thursday. 1st Monday = Oct 5. 2nd Monday = Oct 12
      expect(result).toEqual(new Date(2026, 9, 12))
    })

    it('computes Thanksgiving (4th Thursday in November)', () => {
      const ref = new Date(2026, 0, 1)
      const result = getNextObservationDate('thanksgiving', ref)
      // 2026: Nov 1 is Sunday. 1st Thursday = Nov 5. 4th Thursday = Nov 26
      expect(result).toEqual(new Date(2026, 10, 26))
    })
  })

  describe('last weekday holidays', () => {
    it('computes Memorial Day (last Monday in May)', () => {
      const ref = new Date(2026, 0, 1)
      const result = getNextObservationDate('memorialDay', ref)
      // 2026: May 31 is Sunday. Last Monday = May 25
      expect(result).toEqual(new Date(2026, 4, 25))
    })

    it('computes Memorial Day for 2027', () => {
      const ref = new Date(2027, 0, 1)
      const result = getNextObservationDate('memorialDay', ref)
      // 2027: May 31 is Monday. Last Monday = May 31
      expect(result).toEqual(new Date(2027, 4, 31))
    })
  })

  describe('year rollover', () => {
    it('rolls to next year when all instances have passed', () => {
      const ref = new Date(2026, 11, 26) // Dec 26
      const result = getNextObservationDate('christmasDay', ref)
      expect(result).toEqual(new Date(2027, 11, 25))
    })

    it('rolls Thanksgiving to next year', () => {
      const ref = new Date(2026, 10, 27) // Nov 27 (after Thanksgiving)
      const result = getNextObservationDate('thanksgiving', ref)
      // 2027: Nov 1 is Monday. 4th Thursday = Nov 25
      expect(result).toEqual(new Date(2027, 10, 25))
    })
  })

  it('throws for unknown holiday key', () => {
    expect(() => getNextObservationDate('arbor_day')).toThrow('Unknown holiday key: arbor_day')
  })
})

describe('getDefaultHolidayItems', () => {
  const mockT = ((key: string) => {
    const parts = key.split('.')
    const holidayKey = parts[1]
    const field = parts[2]
    const map: Record<string, Record<string, string>> = {
      newYearsDay: { name: "New Year's Day", observedDate: 'January 1' },
      mlkDay: {
        name: 'Martin Luther King, Jr. Day',
        observedDate: 'Third Monday in January',
      },
      presidentsDay: { name: "Presidents' Day", observedDate: 'Third Monday in February' },
      memorialDay: { name: 'Memorial Day', observedDate: 'Last Monday in May' },
      juneteenth: { name: 'Juneteenth', observedDate: 'June 19' },
      independenceDay: { name: 'Independence Day', observedDate: 'July 4' },
      laborDay: { name: 'Labor Day', observedDate: 'First Monday in September' },
      columbusDay: {
        name: "Columbus Day (Indigenous Peoples' Day)",
        observedDate: 'Second Monday in October',
      },
      veteransDay: { name: 'Veterans Day', observedDate: 'November 11' },
      thanksgiving: { name: 'Thanksgiving', observedDate: 'Fourth Thursday in November' },
      christmasDay: { name: 'Christmas Day', observedDate: 'December 25' },
    }
    return map[holidayKey!]?.[field!] ?? key
  }) as Parameters<typeof getDefaultHolidayItems>[0]

  it('returns 11 holiday items', () => {
    const items = getDefaultHolidayItems(mockT, new Date(2026, 0, 1))
    expect(items).toHaveLength(11)
  })

  it('uses holiday keys as UUIDs', () => {
    const items = getDefaultHolidayItems(mockT, new Date(2026, 0, 1))
    expect(items[0]!.uuid).toBe('newYearsDay')
    expect(items[10]!.uuid).toBe('christmasDay')
  })

  it('uses translated names', () => {
    const items = getDefaultHolidayItems(mockT, new Date(2026, 0, 1))
    expect(items[0]!.name).toBe("New Year's Day")
    expect(items[4]!.name).toBe('Juneteenth')
  })

  it('uses translated observed dates', () => {
    const items = getDefaultHolidayItems(mockT, new Date(2026, 0, 1))
    expect(items[0]!.observedDate).toBe('January 1')
    expect(items[3]!.observedDate).toBe('Last Monday in May')
  })

  it('computes next observation dates', () => {
    const items = getDefaultHolidayItems(mockT, new Date(2026, 0, 1))
    expect(items[0]!.nextObservation).toContain('2026')
    expect(items[0]!.nextObservation).toContain('January')
  })
})

describe('buildFederalHolidaysPayload', () => {
  it('marks selected holidays as selected: true', () => {
    const selected = new Set(['newYearsDay', 'christmasDay'])
    const payload = buildFederalHolidaysPayload(selected)
    expect(payload.newYearsDay).toEqual({ selected: true })
    expect(payload.christmasDay).toEqual({ selected: true })
  })

  it('marks unselected holidays as selected: false', () => {
    const selected = new Set(['newYearsDay'])
    const payload = buildFederalHolidaysPayload(selected)
    expect(payload.mlkDay).toEqual({ selected: false })
    expect(payload.thanksgiving).toEqual({ selected: false })
  })

  it('includes all 11 holidays in payload', () => {
    const payload = buildFederalHolidaysPayload(new Set())
    expect(Object.keys(payload)).toHaveLength(11)
    expect(Object.keys(payload)).toEqual(FEDERAL_HOLIDAY_KEYS)
  })

  it('handles all selected', () => {
    const allSelected = new Set(FEDERAL_HOLIDAY_KEYS)
    const payload = buildFederalHolidaysPayload(allSelected)
    for (const value of Object.values(payload)) {
      expect(value).toEqual({ selected: true })
    }
  })

  it('handles none selected', () => {
    const payload = buildFederalHolidaysPayload(new Set())
    for (const value of Object.values(payload)) {
      expect(value).toEqual({ selected: false })
    }
  })
})
