import { describe, it, expect } from 'vitest'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { EarningTypeList } from '@gusto/embedded-api/models/components/earningtypelist'
import { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'
import {
  normalizeWorkweeks,
  collectOvertimeEarningNames,
  resolveEditableFixedCompensations,
  derivePayrollEditEmployeeDefaults,
  buildPayrollUpdateEmployeeCompensation,
  hasExistingOvertimeHours,
  seedRevealedWeekMaps,
  type NormalizedWorkweek,
} from './payrollEditEmployeeHelpers'
import type { PayrollEditEmployeeFormData } from './payrollEditEmployeeSchema'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'

const WEEK_ONE: NormalizedWorkweek = { startDate: '2024-01-01', endDate: '2024-01-07' }
const WEEK_TWO: NormalizedWorkweek = { startDate: '2024-01-08', endDate: '2024-01-14' }

const emptyFormData: PayrollEditEmployeeFormData = {
  hours: {},
  additionalEarnings: {},
  other: {},
  timeOff: {},
  finalPayout: {},
  reimbursements: [],
  reimbursementDraft: { description: '', amount: '' },
}

describe('normalizeWorkweeks', () => {
  it('normalizes RFCDate boundaries to YYYY-MM-DD strings', () => {
    const result = normalizeWorkweeks(
      [{ startDate: new RFCDate('2024-01-01'), endDate: new RFCDate('2024-01-07') }],
      undefined,
    )

    expect(result).toEqual([{ startDate: '2024-01-01', endDate: '2024-01-07' }])
  })

  it('falls back to a single pay-period-spanning workweek when none are supplied', () => {
    const result = normalizeWorkweeks([], { startDate: '2024-01-01', endDate: '2024-01-14' })

    expect(result).toEqual([{ startDate: '2024-01-01', endDate: '2024-01-14' }])
  })

  it('drops workweeks missing a boundary', () => {
    const result = normalizeWorkweeks(
      [{ startDate: new RFCDate('2024-01-01') }, { endDate: new RFCDate('2024-01-14') }],
      { startDate: '2024-01-01', endDate: '2024-01-14' },
    )

    expect(result).toEqual([{ startDate: '2024-01-01', endDate: '2024-01-14' }])
  })

  it('throws when neither workweeks nor a pay period are present', () => {
    expect(() => normalizeWorkweeks([], undefined)).toThrow()
    expect(() =>
      normalizeWorkweeks(undefined, { startDate: undefined, endDate: undefined }),
    ).toThrow()
  })
})

describe('collectOvertimeEarningNames', () => {
  it('collects default and custom earning names flagged included_in_overtime_pay', () => {
    const earningTypeList: EarningTypeList = {
      default: [
        { uuid: 'et-bonus', name: 'Bonus', includedInOvertimePay: true },
        { uuid: 'et-tips', name: 'Cash Tips', includedInOvertimePay: false },
      ],
      custom: [{ uuid: 'et-spot', name: 'Spot Award', includedInOvertimePay: true }],
    }

    expect(collectOvertimeEarningNames(earningTypeList)).toEqual(new Set(['Bonus', 'Spot Award']))
  })

  it('returns an empty set for an undefined list', () => {
    expect(collectOvertimeEarningNames(undefined)).toEqual(new Set())
  })
})

describe('resolveEditableFixedCompensations', () => {
  const fixedCompensationTypes = [
    { name: 'Bonus' },
    { name: 'Commission' },
    { name: 'Cash Tips' },
    { name: 'Reimbursement' },
  ]

  it('seeds blank placeholders for missing types on the primary job, sorted by name', () => {
    const result = resolveEditableFixedCompensations(
      [{ jobUuid: 'job-1', name: 'Bonus', amount: '500.00' }],
      fixedCompensationTypes,
      'job-1',
      'Nonexempt',
    )

    expect(result).toEqual([
      { jobUuid: 'job-1', name: 'Bonus', amount: '500.00' },
      { jobUuid: 'job-1', name: 'Cash Tips' },
      { jobUuid: 'job-1', name: 'Commission' },
    ])
  })

  it('skips placeholders entirely for owners', () => {
    const result = resolveEditableFixedCompensations([], fixedCompensationTypes, 'job-1', 'Owner')

    expect(result).toEqual([])
  })

  it('keeps existing compensations but omits excluded types', () => {
    const result = resolveEditableFixedCompensations(
      [{ jobUuid: 'job-1', name: 'Reimbursement', amount: '10.00' }],
      fixedCompensationTypes,
      'job-1',
      'Nonexempt',
    )

    expect(result.map(entry => entry.name)).toEqual(['Bonus', 'Cash Tips', 'Commission'])
  })
})

describe('derivePayrollEditEmployeeDefaults', () => {
  const compensation: PayrollEmployeeCompensationsType = {
    employeeUuid: 'emp-1',
    version: 'comp-v1',
    paymentMethod: 'Direct Deposit',
    hourlyCompensations: [{ jobUuid: 'job-1', name: 'Regular Hours', hours: '40.000' }],
    fixedCompensations: [
      { jobUuid: 'job-1', name: 'Bonus', amount: '500.00' },
      { jobUuid: 'job-1', name: 'Cash Tips', amount: '25.00' },
    ],
    paidTimeOff: [],
    reimbursements: [],
  }

  it('trims decimal totals and buckets earnings into additional vs other', () => {
    const defaults = derivePayrollEditEmployeeDefaults(
      compensation,
      [WEEK_ONE],
      true,
      new Set(['Bonus']),
      true,
      true,
    )

    expect(defaults.hours).toEqual({ 'job-1': { 'Regular Hours': { '2024-01-01': '40' } } })
    expect(defaults.additionalEarnings).toEqual({ 'job-1': { Bonus: { '2024-01-01': '500' } } })
    expect(defaults.other).toEqual({ 'job-1': { 'Cash Tips': '25' } })
  })

  it('seeds only the first workweek when the line is not split (overtime-ineligible)', () => {
    const defaults = derivePayrollEditEmployeeDefaults(
      compensation,
      [WEEK_ONE, WEEK_TWO],
      true,
      new Set(['Bonus']),
      false,
      true,
    )

    expect(defaults.hours['job-1']!['Regular Hours']).toEqual({
      '2024-01-01': '40',
      '2024-01-08': '',
    })
  })

  it('seeds each workweek from its breakdown when split (overtime-eligible)', () => {
    const withBreakdowns: PayrollEmployeeCompensationsType = {
      ...compensation,
      hourlyCompensations: [
        {
          jobUuid: 'job-1',
          name: 'Regular Hours',
          hours: '60.0',
          breakdowns: [
            {
              startDate: new RFCDate('2024-01-01'),
              endDate: new RFCDate('2024-01-07'),
              hours: '40',
            },
            {
              startDate: new RFCDate('2024-01-08'),
              endDate: new RFCDate('2024-01-14'),
              hours: '20',
            },
          ],
        },
      ],
    }

    const defaults = derivePayrollEditEmployeeDefaults(
      withBreakdowns,
      [WEEK_ONE, WEEK_TWO],
      true,
      new Set(),
      true,
      true,
    )

    expect(defaults.hours['job-1']!['Regular Hours']).toEqual({
      '2024-01-01': '40',
      '2024-01-08': '20',
    })
  })

  it('leaves every workweek blank for a single breakdown spanning the whole pay period', () => {
    // The API returns one whole-period row when no per-workweek split was set.
    // It must not be pinned to the first workweek; both cells stay blank so the
    // line round-trips as an unsplit total.
    const wholePeriod: PayrollEmployeeCompensationsType = {
      ...compensation,
      hourlyCompensations: [
        {
          jobUuid: 'job-1',
          name: 'Regular Hours',
          hours: '80.0',
          breakdowns: [
            {
              startDate: new RFCDate('2024-01-01'),
              endDate: new RFCDate('2024-01-14'),
              hours: '80',
            },
          ],
        },
      ],
    }

    const defaults = derivePayrollEditEmployeeDefaults(
      wholePeriod,
      [WEEK_ONE, WEEK_TWO],
      true,
      new Set(),
      true,
    )

    expect(defaults.hours['job-1']!['Regular Hours']).toEqual({
      '2024-01-01': '',
      '2024-01-08': '',
    })
  })

  it('forces Check when the employee has no direct deposit set up', () => {
    const defaults = derivePayrollEditEmployeeDefaults(
      compensation,
      [WEEK_ONE],
      false,
      new Set(),
      true,
      true,
    )

    expect(defaults.paymentMethod).toBe(PayrollUpdatePaymentMethod.Check)
  })

  it('stays flat when overtime-eligible but not yet revealed, even on a multi-workweek payroll', () => {
    const defaults = derivePayrollEditEmployeeDefaults(
      compensation,
      [WEEK_ONE, WEEK_TWO],
      true,
      new Set(['Bonus']),
      true,
      false,
    )

    expect(defaults.hours['job-1']!['Regular Hours']).toEqual({
      '2024-01-01': '40',
      '2024-01-08': '',
    })
    expect(defaults.additionalEarnings['job-1']!['Bonus']).toEqual({
      '2024-01-01': '500',
      '2024-01-08': '',
    })
  })
})

describe('hasExistingOvertimeHours', () => {
  it('returns true when an Overtime line has non-zero hours', () => {
    expect(
      hasExistingOvertimeHours([
        { jobUuid: 'job-1', name: 'Regular Hours', hours: '40' },
        { jobUuid: 'job-1', name: 'Overtime', hours: '5' },
      ]),
    ).toBe(true)
  })

  it('returns true when a Double overtime line has non-zero hours', () => {
    expect(
      hasExistingOvertimeHours([{ jobUuid: 'job-1', name: 'Double overtime', hours: '2.5' }]),
    ).toBe(true)
  })

  it('returns false when Overtime/Double overtime lines are zero or absent', () => {
    expect(
      hasExistingOvertimeHours([
        { jobUuid: 'job-1', name: 'Regular Hours', hours: '40' },
        { jobUuid: 'job-1', name: 'Overtime', hours: '0' },
      ]),
    ).toBe(false)
    expect(hasExistingOvertimeHours(undefined)).toBe(false)
  })
})

describe('seedRevealedWeekMaps', () => {
  const compensation: PayrollEmployeeCompensationsType = {
    employeeUuid: 'emp-1',
    version: 'comp-v1',
    hourlyCompensations: [
      { jobUuid: 'job-1', name: 'Regular Hours', hours: '80' },
      { jobUuid: 'job-1', name: 'Overtime', hours: '0' },
    ],
    fixedCompensations: [{ jobUuid: 'job-1', name: 'Bonus', amount: '500.00' }],
    paidTimeOff: [],
    reimbursements: [],
  }

  it('evenly splits a line left entirely blank across workweeks', () => {
    const hours = {
      'job-1': {
        'Regular Hours': { '2024-01-01': '', '2024-01-08': '' },
        Overtime: { '2024-01-01': '', '2024-01-08': '' },
      },
    }
    const result = seedRevealedWeekMaps(hours, {}, compensation, [WEEK_ONE, WEEK_TWO])

    // Regular Hours had a real, non-zero total -- seeded to an even split.
    expect(result.hours['job-1']!['Regular Hours']).toEqual({
      '2024-01-01': '40',
      '2024-01-08': '40',
    })
    // Overtime's original total is 0 -- nothing to preserve, stays blank.
    expect(result.hours['job-1']!.Overtime).toEqual({
      '2024-01-01': '',
      '2024-01-08': '',
    })
  })

  it('leaves a line with a real per-week value untouched', () => {
    const hours = {
      'job-1': {
        'Regular Hours': { '2024-01-01': '40', '2024-01-08': '' },
      },
    }
    const result = seedRevealedWeekMaps(hours, {}, compensation, [WEEK_ONE, WEEK_TWO])

    expect(result.hours['job-1']!['Regular Hours']).toEqual({
      '2024-01-01': '40',
      '2024-01-08': '',
    })
  })

  it('seeds overtime-affecting additional earnings the same way', () => {
    const additionalEarnings = {
      'job-1': { Bonus: { '2024-01-01': '', '2024-01-08': '' } },
    }
    const result = seedRevealedWeekMaps({}, additionalEarnings, compensation, [WEEK_ONE, WEEK_TWO])

    expect(result.additionalEarnings['job-1']!.Bonus).toEqual({
      '2024-01-01': '250',
      '2024-01-08': '250',
    })
  })

  it('splits an odd total without losing a cent to rounding', () => {
    const oddCompensation: PayrollEmployeeCompensationsType = {
      ...compensation,
      hourlyCompensations: [{ jobUuid: 'job-1', name: 'Regular Hours', hours: '81' }],
    }
    const hours = {
      'job-1': { 'Regular Hours': { '2024-01-01': '', '2024-01-08': '' } },
    }
    const result = seedRevealedWeekMaps(hours, {}, oddCompensation, [WEEK_ONE, WEEK_TWO])

    const weekValues = Object.values(result.hours['job-1']!['Regular Hours']!).map(Number)
    expect(weekValues.reduce((sum, value) => sum + value, 0)).toBe(81)
  })
})

describe('buildPayrollUpdateEmployeeCompensation', () => {
  const compensation: PayrollEmployeeCompensationsType = {
    employeeUuid: 'emp-1',
    version: 'comp-v1',
    hourlyCompensations: [{ jobUuid: 'job-1', name: 'Regular Hours', hours: '40' }],
    fixedCompensations: [],
    paidTimeOff: [],
    reimbursements: [],
  }

  it('sends totals without breakdowns for a single-workweek pay period', () => {
    const formData: PayrollEditEmployeeFormData = {
      ...emptyFormData,
      hours: { 'job-1': { 'Regular Hours': { '2024-01-01': '40' } } },
    }

    const result = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE],
      PayrollCategory.Regular,
      true,
      true,
    )

    expect(result.hourlyCompensations).toEqual([
      { jobUuid: 'job-1', name: 'Regular Hours', hours: '40' },
    ])
  })

  it('tiles every workweek with breakdowns once a split job is edited', () => {
    const formData: PayrollEditEmployeeFormData = {
      ...emptyFormData,
      hours: { 'job-1': { 'Regular Hours': { '2024-01-01': '40', '2024-01-08': '20' } } },
    }

    const result = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE, WEEK_TWO],
      PayrollCategory.Regular,
      true,
      true,
    )

    const line = result.hourlyCompensations![0]!
    expect(line.hours).toBe('60')
    expect(line.breakdowns).toHaveLength(2)
    expect(line.breakdowns!.map(breakdown => breakdown.startDate!.toString())).toEqual([
      '2024-01-01',
      '2024-01-08',
    ])
    expect(line.breakdowns!.map(breakdown => breakdown.hours)).toEqual(['40', '20'])
  })

  it('rounds a summed earning amount to cents instead of leaking float error', () => {
    const formData: PayrollEditEmployeeFormData = {
      ...emptyFormData,
      additionalEarnings: { 'job-1': { Bonus: { '2024-01-01': '0.1', '2024-01-08': '0.2' } } },
    }

    const result = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE, WEEK_TWO],
      PayrollCategory.Regular,
      true,
      true,
    )

    const bonus = result.fixedCompensations!.find(entry => entry.name === 'Bonus')!
    expect(bonus.amount).toBe('0.3')
  })

  it('resends the original total with no breakdowns when a split job is untouched', () => {
    const formData: PayrollEditEmployeeFormData = {
      ...emptyFormData,
      hours: { 'job-1': { 'Regular Hours': { '2024-01-01': '', '2024-01-08': '' } } },
    }

    const result = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE, WEEK_TWO],
      PayrollCategory.Regular,
      true,
      true,
    )

    expect(result.hourlyCompensations).toEqual([
      { jobUuid: 'job-1', name: 'Regular Hours', hours: '40' },
    ])
  })

  it('sends the flat total with no breakdowns when overtime-eligible but not revealed, regardless of workweek count', () => {
    const formData: PayrollEditEmployeeFormData = {
      ...emptyFormData,
      hours: { 'job-1': { 'Regular Hours': { '2024-01-01': '55' } } },
    }

    const result = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE, WEEK_TWO],
      PayrollCategory.Regular,
      true,
      false,
    )

    expect(result.hourlyCompensations).toEqual([
      { jobUuid: 'job-1', name: 'Regular Hours', hours: '55' },
    ])
  })

  it('includes final-payout hours only for dismissal payrolls', () => {
    const formData: PayrollEditEmployeeFormData = {
      ...emptyFormData,
      timeOff: { Vacation: '8' },
      finalPayout: { Vacation: '4' },
    }

    const dismissal = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE],
      PayrollCategory.Dismissal,
      true,
      true,
    )
    const regular = buildPayrollUpdateEmployeeCompensation(
      formData,
      compensation,
      [WEEK_ONE],
      PayrollCategory.Regular,
      true,
      true,
    )

    expect(dismissal.paidTimeOff).toEqual([
      { name: 'Vacation', hours: '8', finalPayoutUnusedHoursInput: '4' },
    ])
    expect(regular.paidTimeOff).toEqual([{ name: 'Vacation', hours: '8' }])
  })
})
