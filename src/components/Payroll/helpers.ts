import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type {
  EmployeeCompensations,
  PayrollShowFixedCompensations,
} from '@gusto/embedded-api/models/components/payrollshow'
import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { Compensation, MinimumWages } from '@gusto/embedded-api/models/components/compensation'
import { formatPayRate } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

const REGULAR_HOURS_NAME = 'regular hours'

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

  const primaryJob = employee.jobs.find(job => job.primary) || employee.jobs[0]
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

  const primaryJob = employee.jobs.find(job => job.primary) || employee.jobs[0]
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

export const getRegularHours = (compensation: EmployeeCompensations) => {
  if (!compensation.hourlyCompensations) return 0

  return compensation.hourlyCompensations
    .filter(hourlyCompensation => hourlyCompensation.name?.toLowerCase() === 'regular hours')
    .reduce((sum, hourlyCompensation) => sum + parseFloat(hourlyCompensation.hours || '0'), 0)
}

export const getTotalPtoHours = (compensation: EmployeeCompensations) => {
  if (!compensation.paidTimeOff) {
    return 0
  }
  return compensation.paidTimeOff.reduce((sum, pto) => sum + parseFloat(pto.hours || '0'), 0)
}

export const getAdditionalEarnings = (compensation: EmployeeCompensations) => {
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

export const getReimbursements = (compensation: EmployeeCompensations) => {
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
  const primaryJob = employee.jobs?.find(job => job.primary) || employee.jobs?.[0]
  if (!primaryJob?.compensations) {
    return 0
  }

  const compensation = getEffectiveCompensation(primaryJob.compensations, effectiveDate)
  return compensation ? calculateHourlyRate(compensation) : 0
}

const getTotalOutstandingPtoHours = (compensation: EmployeeCompensations): number => {
  if (!compensation.paidTimeOff) {
    return 0
  }

  return compensation.paidTimeOff.reduce(
    (sum, paidTimeOff) => sum + parseFloat(paidTimeOff.finalPayoutUnusedHoursInput || '0'),
    0,
  )
}

const getPtoHours = (
  compensation: EmployeeCompensations,
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
  compensation: EmployeeCompensations,
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
  compensation: EmployeeCompensations,
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
  compensation: EmployeeCompensations,
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
  compensation: EmployeeCompensations,
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
  compensation: EmployeeCompensations,
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

  const primaryJob = employee.jobs?.find(job => job.primary) || employee.jobs?.[0]
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
