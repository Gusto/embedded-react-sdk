import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { formatPayRate } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

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
