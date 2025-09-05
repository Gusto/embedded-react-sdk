import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { formatPayRate } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

const REGULAR_HOURS_NAME = 'regular hours'

const roundToSixDecimals = (value: number): number => {
  return Math.round(value * 1000000) / 1000000
}

const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}

const isRegularHours = (compensationName: string): boolean => {
  return compensationName.toLowerCase() === REGULAR_HOURS_NAME
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
  if (!compensation.paidTimeOff) return 0
  return compensation.paidTimeOff.reduce((sum, pto) => sum + parseFloat(pto.hours || '0'), 0)
}

export const getAdditionalEarnings = (compensation: EmployeeCompensations) => {
  if (!compensation.fixedCompensations) return 0

  return compensation.fixedCompensations
    .filter(comp => {
      const name = comp.name?.toLowerCase() || ''
      const amount = parseFloat(comp.amount || '0')
      // Exclude reimbursements and minimum wage adjustment
      return name !== 'reimbursement' && name !== 'minimum wage adjustment' && amount > 0
    })
    .reduce((sum, comp) => sum + parseFloat(comp.amount || '0'), 0)
}

export const getReimbursements = (compensation: EmployeeCompensations) => {
  if (!compensation.fixedCompensations) return 0

  const reimbursementComp = compensation.fixedCompensations.find(
    comp => comp.name?.toLowerCase() === 'reimbursement',
  )
  return reimbursementComp ? parseFloat(reimbursementComp.amount || '0') : 0
}

const getPrimaryHourlyRate = (employee: Employee, compensationEffectiveDate?: Date): number => {
  const primaryJob = employee.jobs?.find(job => job.primary) || employee.jobs?.[0]
  if (!primaryJob?.compensations?.[0]) return 0

  const compensation = primaryJob.compensations[0]
  const rate = parseFloat(compensation.rate || '0')
  const paymentUnit = compensation.paymentUnit || 'Hour'

  // Convert salary to hourly rate
  switch (paymentUnit) {
    case 'Hour':
      return rate
    case 'Year':
      return rate / 2080 // 52 weeks * 40 hours
    case 'Month':
      return rate / 173.333333 // Monthly to hourly
    case 'Week':
      return rate / 40 // Weekly to hourly
    case 'Paycheck':
      return rate / 80 // Assuming biweekly paycheck = 80 hours
    default:
      return rate
  }
}

const calculateRegularPlusOvertimePay = (
  compensation: EmployeeCompensations,
  employee: Employee,
): number => {
  if (!compensation.hourlyCompensations || !employee.jobs) return 0

  // Calculate regular rate pay - sum of (hours * hourly_rate) for each hourly compensation
  const regularRatePay = compensation.hourlyCompensations.reduce((sum, hc) => {
    const hours = parseFloat(hc.hours || '0')
    const job = employee.jobs?.find(j => j.uuid === hc.jobUuid)

    if (!job?.compensations?.[0]) return sum

    // Convert job rate to hourly rate (same logic as getPrimaryHourlyRate)
    const jobCompensation = job.compensations[0]
    const rate = parseFloat(jobCompensation.rate || '0')
    const paymentUnit = jobCompensation.paymentUnit || 'Hour'

    let hourlyRate = rate
    switch (paymentUnit) {
      case 'Hour':
        hourlyRate = rate
        break
      case 'Year':
        hourlyRate = rate / 2080 // 52 weeks * 40 hours
        break
      case 'Month':
        hourlyRate = rate / 173.333333 // Monthly to hourly
        break
      case 'Week':
        hourlyRate = rate / 40 // Weekly to hourly
        break
      case 'Paycheck':
        hourlyRate = rate / 80 // Assuming biweekly paycheck = 80 hours
        break
    }

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

const calculatePtoPay = (compensation: EmployeeCompensations, employee: Employee): number => {
  const ptoHours = getTotalPtoHours(compensation)
  const primaryHourlyRate = getPrimaryHourlyRate(employee)
  return ptoHours * primaryHourlyRate
}

export const calculateGrossPay = (
  compensation: EmployeeCompensations,
  employee: Employee,
): number => {
  if (compensation.excluded) {
    return 0
  }

  const regularPlusOvertimePay = calculateRegularPlusOvertimePay(compensation, employee)
  const fixedPay = getAdditionalEarnings(compensation)
  const ptoPay = calculatePtoPay(compensation, employee)
  const minimumWageAdjustment = 0 // Simplified - return 0 for now

  const total = regularPlusOvertimePay + fixedPay + ptoPay + minimumWageAdjustment
  return roundToTwoDecimals(total)
}
