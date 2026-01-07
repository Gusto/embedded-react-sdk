import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollShowFixedCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { FixedCompensations } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { Compensation, MinimumWages } from '@gusto/embedded-api/models/components/compensation'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayrollType } from './PayrollList/types'
import { formatPayRate } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { COMPENSATION_NAME_REIMBURSEMENT, FlsaStatus } from '@/shared/constants'

const REGULAR_HOURS_NAME = 'regular hours'

// Utility to get the primary job from an employee
export const getPrimaryJob = (employee: Employee) => {
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

export const getEmployeePayRateInfo = (employee: Employee | undefined) => {
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

  return { rate, paymentUnit }
}

export const getRegularHours = (compensation: PayrollEmployeeCompensationsType) => {
  if (!compensation.hourlyCompensations) return 0

  return compensation.hourlyCompensations
    .filter(hourlyCompensation => hourlyCompensation.name?.toLowerCase() === 'regular hours')
    .reduce((sum, hourlyCompensation) => sum + parseFloat(hourlyCompensation.hours || '0'), 0)
}

export function getOvertimeHours(compensation: PayrollEmployeeCompensationsType) {
  if (!compensation.hourlyCompensations || compensation.excluded) {
    return 0
  }

  return compensation.hourlyCompensations
    .filter(hourlyCompensation => Number(hourlyCompensation.compensationMultiplier) > 1)
    .reduce((sum, hourlyCompensation) => sum + parseFloat(hourlyCompensation.hours || '0'), 0)
}

export const getTotalPtoHours = (compensation: PayrollEmployeeCompensationsType) => {
  if (!compensation.paidTimeOff) {
    return 0
  }
  return compensation.paidTimeOff.reduce((sum, pto) => sum + parseFloat(pto.hours || '0'), 0)
}

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

export const getReimbursements = (compensation: PayrollEmployeeCompensationsType) => {
  if (!compensation.fixedCompensations) {
    return 0
  }

  const reimbursementComp = compensation.fixedCompensations.find(
    fixedCompensation => fixedCompensation.name?.toLowerCase() === 'reimbursement',
  )
  return reimbursementComp ? parseFloat(reimbursementComp.amount || '0') : 0
}

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

export const calculateGrossPay = (
  compensation: PayrollEmployeeCompensationsType,
  employee: Employee,
  compensationEffectiveDateString?: string,
  paySchedule?: PayScheduleObject,
  isOffCycle: boolean = false,
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

  const ptoHours = getPtoHours(
    compensation,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    isOffCycle,
  )

  const regularPlusOvertimePay = calculateRegularPlusOvertimePay(
    compensation,
    employee,
    compensationEffectiveDate,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    ptoHours,
    isOffCycle,
  )

  const fixedPay = getAdditionalEarnings(compensation)
  const ptoPay = calculatePtoPay(
    compensation,
    employee,
    compensationEffectiveDate,
    isSalariedWithExpectedHours,
    hoursInPayPeriod,
    isOffCycle,
  )
  const minimumWageAdjustment = calculateMinimumWageAdjustment(
    primaryCompensation,
    compensation,
    compensationEffectiveDate,
  )

  const total = regularPlusOvertimePay + fixedPay + ptoPay + minimumWageAdjustment
  return roundToTwoDecimals(total)
}

// Payroll type and status utilities
export const getPayrollType = (payroll: {
  external?: boolean
  offCycle?: boolean
}): PayrollType => {
  if (payroll.external) return 'External'
  if (payroll.offCycle) return 'Off-Cycle'
  return 'Regular'
}

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

export const getReimbursementCompensation = (
  fixedCompensations: FixedCompensations[],
  fixedCompensationTypes: PayrollFixedCompensationTypesType[],
  primaryJobUuid?: string,
) => {
  const reimbursementCompensation = fixedCompensations.find(
    comp => comp.name?.toLowerCase() === COMPENSATION_NAME_REIMBURSEMENT.toLowerCase(),
  )

  if (reimbursementCompensation) {
    return reimbursementCompensation
  }

  if (
    primaryJobUuid &&
    fixedCompensationTypes.some(
      type => type.name?.toLowerCase() === COMPENSATION_NAME_REIMBURSEMENT.toLowerCase(),
    )
  ) {
    return {
      name: COMPENSATION_NAME_REIMBURSEMENT,
      amount: '0.00',
      jobUuid: primaryJobUuid,
    }
  }

  return null
}

// Total Payroll = Gross Pay + Employer Taxes + Reimbursements + Benefits
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
 * Determines if a payroll can be cancelled based on business rules.
 *
 * A payroll can be cancelled if all of the following conditions are met:
 * - The payroll has been processed (processed === true)
 * - Current time is before 4:00 PM PT on the payroll deadline
 * - The payrollStatusMeta.cancellable flag is not explicitly false
 *
 * This check enforces the business rule that payrolls can only be cancelled
 * before the 4:00 PM PT cutoff time on their deadline date.
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

  const nowInPT = new Date(now.getTime() + getPacificTimeOffset(now) * 60 * 60 * 1000)
  const deadlineInPT = new Date(
    deadline.getTime() + getPacificTimeOffset(deadline) * 60 * 60 * 1000,
  )

  const cutoffTime = new Date(deadlineInPT)
  cutoffTime.setUTCHours(16, 0, 0, 0)

  if (nowInPT >= cutoffTime) {
    return false
  }

  return true
}
