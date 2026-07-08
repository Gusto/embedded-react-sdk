import type { Employee } from '@gusto/embedded-api/models/components/employee'
import {
  type PayrollShowFixedCompensations,
  OffCycleReasonType,
} from '@gusto/embedded-api/models/components/payrollshow'
import type {
  FixedCompensations,
  Reimbursements as Reimbursement,
} from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateReimbursements } from '@gusto/embedded-api/models/components/payrollupdate'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { PayScheduleShow as PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { Compensation, MinimumWages } from '@gusto/embedded-api/models/components/compensation'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollType } from './PayrollList/types'
import { PayrollCategory, isOffCyclePayroll } from './payrollTypes'
import { formatPayRate } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { FlsaStatus } from '@/shared/constants'
import { MS_PER_HOUR } from '@/helpers/dateFormatting'
const REGULAR_HOURS_NAME = 'regular hours'

// Utility to get the primary job from an employee
const getPrimaryJob = (employee: Employee) => {
  return employee.jobs?.find(job => job.primary) || employee.jobs?.[0] || null
}

const roundToSixDecimals = (value: number): number => {
  return Math.round(value * 1_000_000) / 1_000_000
}

const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}

const isRegularHours = (compensationName: string): boolean => {
  return compensationName.toLowerCase() === REGULAR_HOURS_NAME
}

const PAY_PERIOD_HOURS_MAPPINGS: Record<string, number> = {
  Daily: 8.0,
  'Every week': 40.0,
  'Every other week': 80.0,
  'Twice per month': 86.666667,
  Monthly: 173.333333,
  Quarterly: 520.0,
  Semiannually: 1040.0,
  Annually: 2080.0,
}

/**
 * Formats an employee's primary-job pay rate into a localized display string.
 *
 * @remarks
 * Returns `null` when the employee has no jobs, the primary job has no compensations, or the rate is missing
 * or zero.
 *
 * @param args - The employee, translation function, and locale to format against.
 * @returns The formatted pay-rate string, or `null` when no usable rate is available.
 * @internal
 */
export const formatEmployeePayRate = ({
  employee,
  t,
  locale = 'en-US',
}: {
  employee?: Employee
  t: TFunction
  locale?: string
}) => {
  if (!employee?.jobs) {
    return null
  }

  const primaryJob = getPrimaryJob(employee)
  if (!primaryJob?.compensations) {
    return null
  }

  const jobCompensation = primaryJob.compensations[0]
  if (!jobCompensation) {
    return null
  }
  if (!jobCompensation.rate || parseFloat(jobCompensation.rate) === 0) {
    return null
  }

  const rate = parseFloat(jobCompensation.rate)
  const paymentUnit = jobCompensation.paymentUnit || 'Hour'

  return formatPayRate({ rate, paymentUnit, t, locale })
}

/**
 * Returns a memoized formatter that produces a localized pay-rate string from an employee's primary job.
 *
 * @returns A callback that takes an `Employee` and returns the formatted pay-rate string, or `null` when the
 *   employee has no usable primary-job compensation.
 * @internal
 */
export const useFormatEmployeePayRate = () => {
  const { t } = useTranslation('common')
  const { locale } = useLocale()

  return useCallback(
    (employee?: Employee) => {
      return formatEmployeePayRate({ employee, t, locale })
    },
    [t, locale],
  )
}

/**
 * Sums hourly-compensation rows named `'regular hours'`.
 *
 * @param compensation - The employee compensation entry.
 * @returns The total regular hours worked, or `0` when none are recorded.
 * @internal
 */
export const getRegularHours = (compensation: PayrollEmployeeCompensationsType) => {
  if (!compensation.hourlyCompensations) return 0

  return compensation.hourlyCompensations
    .filter(hourlyCompensation => hourlyCompensation.name?.toLowerCase() === 'regular hours')
    .reduce((sum, hourlyCompensation) => sum + parseFloat(hourlyCompensation.hours || '0'), 0)
}

/**
 * Sums the overtime hours (multiplier greater than `1`) from an employee compensation.
 *
 * @param compensation - The employee compensation entry.
 * @returns The total overtime hours, or `0` when the compensation is excluded or has none.
 * @internal
 */
export function getOvertimeHours(compensation: PayrollEmployeeCompensationsType) {
  if (!compensation.hourlyCompensations || compensation.excluded) {
    return 0
  }

  return compensation.hourlyCompensations
    .filter(hourlyCompensation => Number(hourlyCompensation.compensationMultiplier) > 1)
    .reduce((sum, hourlyCompensation) => sum + parseFloat(hourlyCompensation.hours || '0'), 0)
}

/**
 * Sums the paid-time-off hours from an employee compensation.
 *
 * @param compensation - The employee compensation entry.
 * @returns The total PTO hours, or `0` when none are recorded.
 * @internal
 */
export const getTotalPtoHours = (compensation: PayrollEmployeeCompensationsType) => {
  if (!compensation.paidTimeOff) {
    return 0
  }
  return compensation.paidTimeOff.reduce((sum, pto) => sum + parseFloat(pto.hours || '0'), 0)
}

/**
 * Sums fixed-compensation amounts excluding reimbursements and minimum-wage adjustments.
 *
 * @param compensation - The employee compensation entry.
 * @returns The total additional earnings amount, or `0` when none qualify.
 * @internal
 */
export const getAdditionalEarnings = (compensation: PayrollEmployeeCompensationsType) => {
  if (!compensation.fixedCompensations) {
    return 0
  }

  return compensation.fixedCompensations
    .filter(fixedCompensation => {
      const name = fixedCompensation.name?.toLowerCase() || ''
      const amount = parseFloat(fixedCompensation.amount || '0')
      return name !== 'reimbursement' && name !== 'minimum wage adjustment' && amount > 0
    })
    .reduce((sum, fixedCompensation) => sum + parseFloat(fixedCompensation.amount || '0'), 0)
}

/**
 * Returns the total reimbursement amount for an employee compensation.
 *
 * @remarks
 * Prefers the explicit `reimbursements` array when present; falls back to a fixed-compensation row named
 * `'Reimbursement'` for older payroll shapes.
 *
 * @param compensation - The employee compensation entry.
 * @returns The summed reimbursement amount, or `0` when none.
 * @internal
 */
export const getReimbursements = (compensation: PayrollEmployeeCompensationsType) => {
  if (compensation.reimbursements && compensation.reimbursements.length > 0) {
    return compensation.reimbursements.reduce(
      (sum, reimbursement) => sum + parseFloat(reimbursement.amount || '0'),
      0,
    )
  }

  if (!compensation.fixedCompensations) {
    return 0
  }

  const reimbursementComp = compensation.fixedCompensations.find(
    fixedCompensation => fixedCompensation.name?.toLowerCase() === 'reimbursement',
  )
  return reimbursementComp ? parseFloat(reimbursementComp.amount || '0') : 0
}

/**
 * Normalizes a reimbursement list for submission to the v2025-11-15 API.
 *
 * @remarks
 * - Drops named rows that would be no-ops on the server (zero amount with no existing uuid).
 * - Drops named rows with an existing uuid and zero amount — these are removals, and the backend's
 *   `replace_itemized_reimbursements` deletes any persisted reimbursement whose uuid is omitted from the
 *   incoming list.
 * - Consolidates multiple unnamed (description-less) rows into a single unnamed entry, since the API rejects
 *   more than one unnamed reimbursement per employee.
 * - When the consolidated unnamed total is zero, sends no unnamed entry at all. The backend's full-replace
 *   semantics then delete any persisted unnamed entry (unnamed entries never have uuids, so this is the only
 *   way to remove them).
 * - Maps the read shape (`description: string | null`) to the write shape (`description?: string`), omitting
 *   the field when there is no description.
 *
 * @param reimbursements - The reimbursements pulled from the prepared payroll.
 * @returns The normalized reimbursements ready to send on a payroll update.
 * @internal
 */
export const cleanupReimbursements = (
  reimbursements: Reimbursement[],
): PayrollUpdateReimbursements[] => {
  const consolidated: PayrollUpdateReimbursements[] = []
  let unnamedTotal = 0

  reimbursements.forEach(reimbursement => {
    const amount = reimbursement.amount
    const numericAmount = parseFloat(amount || '0')
    const description = reimbursement.description?.trim() || ''
    const uuid = reimbursement.uuid ?? undefined

    if (description === '') {
      unnamedTotal += numericAmount
      return
    }

    if (numericAmount === 0 && !uuid) {
      return
    }

    consolidated.push({
      amount,
      description,
      ...(uuid ? { uuid } : {}),
    })
  })

  if (unnamedTotal > 0) {
    consolidated.push({
      amount: unnamedTotal.toFixed(2),
    })
  }

  return consolidated
}

/**
 * Formats an hours value for display, rounding to two decimals and ensuring whole numbers render with `.0`.
 *
 * @param hours - The hours value to format.
 * @returns A string like `'40.0'` or `'37.25'`.
 * @internal
 */
export const formatHoursDisplay = (hours: number): string => {
  const rounded = roundToTwoDecimals(hours)

  if (rounded % 1 === 0) {
    return `${rounded}.0`
  }

  return rounded.toString()
}

const getHoursInPayPeriod = (paySchedule: PayScheduleObject): number => {
  if (!paySchedule.frequency) {
    return 0
  }

  return PAY_PERIOD_HOURS_MAPPINGS[paySchedule.frequency] || 0
}

const getEffectiveCompensation = (
  compensations: Compensation[],
  effectiveDate: Date,
): Compensation | null => {
  if (!compensations.length) return null

  const sorted = [...compensations].sort(
    (a, b) =>
      (a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0) -
      (b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0),
  )

  for (let i = sorted.length - 1; i >= 0; i--) {
    const currentDateString = sorted[i]?.effectiveDate
    const currentDate = currentDateString ? new Date(currentDateString) : null
    if (currentDate && currentDate <= effectiveDate) {
      return sorted[i] || null
    }
  }

  return sorted[0] || null
}

const getEffectiveMinimumWage = (
  minimumWages: MinimumWages[],
  effectiveDate: Date,
): MinimumWages | null => {
  if (!minimumWages.length) return null

  const sorted = [...minimumWages].sort(
    (a, b) =>
      (a.effectiveDate ? new Date(a.effectiveDate).getTime() : 0) -
      (b.effectiveDate ? new Date(b.effectiveDate).getTime() : 0),
  )

  for (let i = sorted.length - 1; i >= 0; i--) {
    const currentDateString = sorted[i]?.effectiveDate
    const currentDate = currentDateString ? new Date(currentDateString) : null
    if (currentDate && currentDate <= effectiveDate) {
      return sorted[i] || null
    }
  }

  return sorted[0] || null
}

const isSalaried = (compensation: Compensation): boolean => {
  return compensation.flsaStatus === 'Exempt' || compensation.flsaStatus === 'Salaried Nonexempt'
}

const getTotalTipCompensations = (fixedCompensations: PayrollShowFixedCompensations[]): number => {
  if (!fixedCompensations.length) return 0

  return fixedCompensations
    .filter(fixedCompensation => {
      const name = fixedCompensation.name?.toLowerCase()
      const amount = parseFloat(fixedCompensation.amount || '0')
      return (name === 'paycheck tips' || name === 'cash tips') && amount > 0
    })
    .reduce((sum, fixedCompensation) => sum + parseFloat(fixedCompensation.amount || '0'), 0)
}

const calculateHourlyRate = (compensation: Compensation): number => {
  const rate = parseFloat(compensation.rate || '0')
  const paymentUnit = compensation.paymentUnit || 'Hour'

  switch (paymentUnit) {
    case 'Hour':
      return rate
    case 'Year':
      return rate / 2080 // 52 weeks * 40 hours
    case 'Month':
      return rate / 173.333333
    case 'Week':
      return rate / 40
    case 'Paycheck':
      return 0 // Paycheck rate is 0 for hourly calculation
    default:
      return rate
  }
}

const getHourlyRateForJob = (employee: Employee, jobUuid: string, effectiveDate: Date): number => {
  const job = employee.jobs?.find(j => j.uuid === jobUuid)
  if (!job?.compensations) {
    return 0
  }

  const compensation = getEffectiveCompensation(job.compensations, effectiveDate)
  return compensation ? calculateHourlyRate(compensation) : 0
}

const getPrimaryHourlyRate = (employee: Employee, effectiveDate: Date): number => {
  const primaryJob = getPrimaryJob(employee)
  if (!primaryJob?.compensations) {
    return 0
  }

  const compensation = getEffectiveCompensation(primaryJob.compensations, effectiveDate)
  return compensation ? calculateHourlyRate(compensation) : 0
}

const getTotalOutstandingPtoHours = (compensation: PayrollEmployeeCompensationsType): number => {
  if (!compensation.paidTimeOff) {
    return 0
  }

  return compensation.paidTimeOff.reduce(
    (sum, paidTimeOff) => sum + parseFloat(paidTimeOff.finalPayoutUnusedHoursInput || '0'),
    0,
  )
}

const getPtoHours = (
  compensation: PayrollEmployeeCompensationsType,
  isSalariedWithExpectedHours: boolean,
  hoursInPayPeriod: number,
  offCycle: boolean,
): number => {
  const regularPtoHours = getTotalPtoHours(compensation)

  if (offCycle) {
    const outstandingPtoHours = getTotalOutstandingPtoHours(compensation)
    return regularPtoHours + outstandingPtoHours
  }

  if (isSalariedWithExpectedHours) {
    return Math.min(hoursInPayPeriod, regularPtoHours)
  }

  return regularPtoHours
}

const calculateMinimumWageAdjustment = (
  primaryCompensation: Compensation,
  compensation: PayrollEmployeeCompensationsType,
  effectiveDate: Date,
): number => {
  if (!primaryCompensation.adjustForMinimumWage) return 0

  const effectiveMinWage = getEffectiveMinimumWage(
    primaryCompensation.minimumWages || [],
    effectiveDate,
  )
  if (!effectiveMinWage) {
    return 0
  }

  const totalHours =
    compensation.hourlyCompensations?.reduce(
      (sum, hourlyCompensation) => sum + parseFloat(hourlyCompensation.hours || '0'),
      0,
    ) || 0

  const hourlyRate = calculateHourlyRate(primaryCompensation)

  const totalTipCredit = (parseFloat(effectiveMinWage.wage || '0') - hourlyRate) * totalHours
  const totalTips = getTotalTipCompensations(compensation.fixedCompensations || [])

  return Math.max(0, totalTipCredit - totalTips)
}

const calculateRegularPlusOvertimePay = (
  compensation: PayrollEmployeeCompensationsType,
  employee: Employee,
  effectiveDate: Date,
  isSalariedWithExpectedHours: boolean,
  hoursInPayPeriod: number,
  ptoHours: number,
  isOffCycle: boolean,
): number => {
  if (!isOffCycle && isSalariedWithExpectedHours) {
    const primaryHourlyRate = getPrimaryHourlyRate(employee, effectiveDate)
    return primaryHourlyRate * (hoursInPayPeriod - ptoHours)
  }

  if (!compensation.hourlyCompensations || !employee.jobs) {
    return 0
  }

  const regularRatePay = compensation.hourlyCompensations.reduce((sum, hc) => {
    const hours = parseFloat(hc.hours || '0')
    const hourlyRate = getHourlyRateForJob(employee, hc.jobUuid || '', effectiveDate)
    return sum + hours * hourlyRate
  }, 0)

  const totalHours = compensation.hourlyCompensations.reduce((sum, hc) => {
    return sum + parseFloat(hc.hours || '0')
  }, 0)

  if (totalHours === 0) return regularRatePay

  const overtimeWeightedRate = roundToSixDecimals(regularRatePay / totalHours)

  // Calculate overtime pay for non-regular hours
  const overtimePay = compensation.hourlyCompensations
    .filter(hc => !isRegularHours(hc.name || ''))
    .reduce((sum, hc) => {
      const hours = parseFloat(hc.hours || '0')
      const multiplier = hc.compensationMultiplier || 1
      return sum + hours * overtimeWeightedRate * (multiplier - 1)
    }, 0)

  return regularRatePay + overtimePay
}

const calculatePtoPay = (
  compensation: PayrollEmployeeCompensationsType,
  employee: Employee,
  effectiveDate: Date,
  isSalariedWithExpectedHours: boolean,
  hoursInPayPeriod: number,
  offCycle: boolean,
): number => {
  const ptoHours = getPtoHours(
    compensation,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    offCycle,
  )
  const primaryHourlyRate = getPrimaryHourlyRate(employee, effectiveDate)
  return ptoHours * primaryHourlyRate
}

const isSalariedWithPayPeriodExpectedHours = (
  compensation: PayrollEmployeeCompensationsType,
  isSalaried: boolean,
  hoursInPayPeriod: number,
): boolean => {
  if (!isSalaried) return false

  const regularHourlyCompensation = compensation.hourlyCompensations?.find(hourlyCompensation =>
    isRegularHours(hourlyCompensation.name || ''),
  )

  if (!regularHourlyCompensation) return false

  const regularHours = parseFloat(regularHourlyCompensation.hours || '0')
  return regularHours === hoursInPayPeriod
}

/**
 * Calculates an employee's gross pay for a payroll, combining regular and overtime pay,
 * additional earnings, PTO pay, and any minimum-wage adjustment.
 *
 * @remarks
 * Returns `0` when the compensation is excluded or the employee has no primary job compensation effective
 * on the given date. The result is rounded to two decimal places.
 *
 * @param compensation - The employee compensation entry from the payroll.
 * @param employee - The employee record (used to look up jobs and effective compensations).
 * @param compensationEffectiveDateString - ISO date used to resolve the effective compensation; defaults to now.
 * @param paySchedule - The pay schedule, used to derive expected hours per pay period.
 * @param payrollCategory - The payroll category; off-cycle categories change how PTO hours are summed.
 * @returns The gross pay amount.
 * @internal
 */
export const calculateGrossPay = (
  compensation: PayrollEmployeeCompensationsType,
  employee: Employee,
  compensationEffectiveDateString?: string,
  paySchedule?: PayScheduleObject,
  payrollCategory: PayrollCategory = PayrollCategory.Regular,
): number => {
  if (compensation.excluded) {
    return 0
  }

  const compensationEffectiveDate = compensationEffectiveDateString
    ? new Date(compensationEffectiveDateString)
    : new Date()

  const primaryJob = getPrimaryJob(employee)
  if (!primaryJob?.compensations) {
    return 0
  }

  const primaryCompensation = getEffectiveCompensation(
    primaryJob.compensations,
    compensationEffectiveDate,
  )

  if (!primaryCompensation) {
    return 0
  }

  const salaried = isSalaried(primaryCompensation)
  const hoursInPayPeriod = paySchedule ? getHoursInPayPeriod(paySchedule) : 0

  const isSalariedWithExpectedHours = isSalariedWithPayPeriodExpectedHours(
    compensation,
    salaried,
    hoursInPayPeriod,
  )

  const offCycle = isOffCyclePayroll(payrollCategory)

  const ptoHours = getPtoHours(
    compensation,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    offCycle,
  )

  const regularPlusOvertimePay = calculateRegularPlusOvertimePay(
    compensation,
    employee,
    compensationEffectiveDate,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    ptoHours,
    offCycle,
  )

  const fixedPay = getAdditionalEarnings(compensation)
  const ptoPay = calculatePtoPay(
    compensation,
    employee,
    compensationEffectiveDate,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    offCycle,
  )
  const minimumWageAdjustment = calculateMinimumWageAdjustment(
    primaryCompensation,
    compensation,
    compensationEffectiveDate,
  )

  const total = regularPlusOvertimePay + fixedPay + ptoPay + minimumWageAdjustment
  return roundToTwoDecimals(total)
}

/**
 * Returns the high-level payroll type — `'External'`, `'Off-Cycle'`, or `'Regular'`.
 *
 * @param payroll - The payroll whose type to classify.
 * @returns The payroll type string.
 * @internal
 */
export const getPayrollType = (payroll: {
  external?: boolean
  offCycle?: boolean
}): PayrollType => {
  if (payroll.external) return 'External'
  if (payroll.offCycle) return 'Off-Cycle'
  return 'Regular'
}

/**
 * Returns whether an off-cycle reason indicates a dismissal payroll.
 *
 * @param offCycleReason - The payroll's off-cycle reason string.
 * @returns `true` when the reason matches the dismissed-employee reason.
 * @internal
 */
export const isDismissalPayroll = (offCycleReason?: string | null): boolean =>
  offCycleReason === OffCycleReasonType.DismissedEmployee

const OFF_CYCLE_REASON_LABELS: Record<string, string> = {
  Bonus: 'Bonus',
  Correction: 'Correction',
  'Transition from old pay schedule': 'Transition',
  'Dismissed employee': 'Dismissal',
  'Hired employee': 'New Hire',
  'Benefit reversal': 'Benefit Reversal',
  'Wage correction': 'Wage Correction',
  'Tax reconciliation': 'Tax Reconciliation',
  Reversal: 'Reversal',
  'Disability insurance distribution': 'Disability Insurance',
}

/**
 * Returns a human-readable label describing the payroll type, mapping off-cycle reasons to display strings.
 *
 * @param payroll - The payroll whose type to describe.
 * @returns `'External'`, `'Regular'`, `'Off-Cycle'`, or a label derived from the off-cycle reason
 *   (e.g. `'Bonus'`, `'Dismissal'`).
 * @internal
 */
export const getPayrollTypeLabel = (payroll: {
  external?: boolean
  offCycle?: boolean
  offCycleReason?: string | null
}): string => {
  if (payroll.external) return 'External'
  if (payroll.offCycle && payroll.offCycleReason) {
    return OFF_CYCLE_REASON_LABELS[payroll.offCycleReason] ?? payroll.offCycleReason
  }
  if (payroll.offCycle) return 'Off-Cycle'
  return 'Regular'
}

/**
 * Merges existing fixed compensations with placeholder entries for any compensation types the employee
 * doesn't yet have, then filters out excluded types and sorts the result alphabetically.
 *
 * @remarks
 * Owners (FLSA status `Owner`) never receive placeholder entries. Placeholders are added with `amount: '0.00'`
 * and the supplied `primaryJobUuid`.
 *
 * @param options - Inputs controlling which placeholder entries to add and which types to exclude.
 * @returns The merged, filtered, and sorted list of fixed compensations.
 * @internal
 */
export const getAdditionalEarningsCompensations = ({
  flsaStatus,
  existingFixedCompensations = [],
  primaryJobUuid,
  fixedCompensationTypes = [],
  excludedTypes = [],
}: {
  flsaStatus: string | undefined
  existingFixedCompensations?: FixedCompensations[]
  primaryJobUuid?: string
  fixedCompensationTypes?: PayrollFixedCompensationTypesType[]
  excludedTypes?: string[]
}): FixedCompensations[] => {
  const allFixedCompensations = [...existingFixedCompensations]

  if (flsaStatus !== FlsaStatus.OWNER && primaryJobUuid && fixedCompensationTypes.length > 0) {
    const compensationTypeNames = fixedCompensationTypes
      .map(type => type.name)
      .filter(Boolean) as string[]

    compensationTypeNames.forEach(compensationName => {
      const exists = allFixedCompensations.some(
        comp => comp.name?.toLowerCase() === compensationName.toLowerCase(),
      )

      if (!exists) {
        allFixedCompensations.push({
          name: compensationName,
          amount: '0.00',
          jobUuid: primaryJobUuid,
        })
      }
    })
  }

  // Filter and sort additional earnings (exclude specified types)
  return allFixedCompensations
    .filter(comp => comp.name && !excludedTypes.includes(comp.name))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

/**
 * Returns whether any non-excluded employee compensation uses Direct Deposit.
 *
 * @remarks
 * When the input is empty or every compensation is excluded, returns `true` so callers don't gate UI on an
 * empty set.
 *
 * @param employeeCompensations - The employee compensations to inspect.
 * @returns `true` when at least one active compensation pays via Direct Deposit, or when the list is empty.
 * @internal
 */
export const hasDirectDepositEmployees = (
  employeeCompensations?: Array<{ paymentMethod?: string | null; excluded?: boolean }>,
): boolean => {
  if (!employeeCompensations || employeeCompensations.length === 0) return true
  const activeCompensations = employeeCompensations.filter(comp => !comp.excluded)
  if (activeCompensations.length === 0) return true
  return activeCompensations.some(comp => comp.paymentMethod === 'Direct Deposit')
}

/**
 * Sums gross pay, employer taxes, reimbursements, and benefits from a payroll's totals.
 *
 * @param payrollData - The payroll whose totals to sum.
 * @returns The total payroll cost, or `0` when `payrollData.totals` is missing.
 * @internal
 */
export const calculateTotalPayroll = (payrollData: Payroll) => {
  const totalPayroll = payrollData.totals
    ? Number(payrollData.totals.grossPay ?? 0) +
      Number(payrollData.totals.employerTaxes ?? 0) +
      Number(payrollData.totals.reimbursements ?? 0) +
      Number(payrollData.totals.benefits ?? 0)
    : 0

  return totalPayroll
}

/**
 * Converts a Date to Pacific Time considering Daylight Saving Time.
 * Returns the UTC offset in hours (e.g., -7 for PDT, -8 for PST).
 *
 * DST rules for Pacific Time:
 * - Starts: Second Sunday in March at 2:00 AM
 * - Ends: First Sunday in November at 2:00 AM
 */
const getPacificTimeOffset = (date: Date): number => {
  const year = date.getFullYear()

  const secondSundayMarch = new Date(year, 2, 1)
  secondSundayMarch.setDate(1 + (7 - secondSundayMarch.getDay()) + 7)

  const firstSundayNovember = new Date(year, 10, 1)
  firstSundayNovember.setDate(1 + ((7 - firstSundayNovember.getDay()) % 7))

  const isDST = date >= secondSundayMarch && date < firstSundayNovember
  return isDST ? -7 : -8
}

/**
 * Determines whether a payroll can be cancelled based on its status, deadline, and the 4:00 PM PT cutoff.
 *
 * @remarks
 * Returns `true` only when the payroll has been processed, `payrollStatusMeta.cancellable` is not explicitly `false`,
 * the payroll has a `payrollDeadline`, and the current time is before 4:00 PM Pacific Time on that deadline date.
 *
 * @param payroll - The payroll to evaluate.
 * @returns `true` if the payroll is still cancellable, `false` otherwise.
 * @internal
 */
export const canCancelPayroll = (payroll: Payroll): boolean => {
  if (payroll.payrollStatusMeta?.cancellable === false) {
    return false
  }

  if (!payroll.processed) {
    return false
  }

  if (!payroll.payrollDeadline) {
    return false
  }

  const now = new Date()
  const deadline = new Date(payroll.payrollDeadline)

  const nowInPT = new Date(now.getTime() + getPacificTimeOffset(now) * MS_PER_HOUR)
  const deadlineInPT = new Date(deadline.getTime() + getPacificTimeOffset(deadline) * MS_PER_HOUR)

  const cutoffTime = new Date(deadlineInPT)
  cutoffTime.setUTCHours(16, 0, 0, 0)

  if (nowInPT >= cutoffTime) {
    return false
  }

  return true
}
