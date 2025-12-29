import { useState } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeEmploymentsCreateTerminationMutation } from '@gusto/embedded-api/react-query/employeeEmploymentsCreateTermination'
import {
  EmployeeTerminationsPresentation,
  type PayrollOption,
} from './EmployeeTerminationsPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface EmployeeTerminationsProps extends BaseComponentInterface<'Terminations.EmployeeTerminations'> {
  employeeId: string
}

export function EmployeeTerminations(props: EmployeeTerminationsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, dictionary }: EmployeeTerminationsProps) => {
  useComponentDictionary('Terminations.EmployeeTerminations', dictionary)
  useI18n('Terminations.EmployeeTerminations')

  const { onEvent, baseSubmitHandler } = useBase()

  const [lastDayOfWork, setLastDayOfWork] = useState<Date | null>(null)
  const [payrollOption, setPayrollOption] = useState<PayrollOption | null>(null)
  const [lastDayError, setLastDayError] = useState<string>()
  const [payrollOptionError, setPayrollOptionError] = useState<string>()

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  const { mutateAsync: createTermination, isPending } =
    useEmployeeEmploymentsCreateTerminationMutation()

  const employeeName = [employee?.firstName, employee?.lastName].filter(Boolean).join(' ')

  const validateForm = (): boolean => {
    let isValid = true

    if (!lastDayOfWork) {
      setLastDayError('Last day of work is required')
      isValid = false
    } else {
      setLastDayError(undefined)
    }

    if (!payrollOption) {
      setPayrollOptionError('Please select how to handle the final payroll')
      isValid = false
    } else {
      setPayrollOptionError(undefined)
    }

    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const effectiveDate = lastDayOfWork!.toISOString().split('T')[0]!

    await baseSubmitHandler({ effectiveDate, payrollOption }, async () => {
      const runTerminationPayroll = payrollOption === 'dismissalPayroll'

      const result = await createTermination({
        request: {
          employeeId,
          requestBody: {
            effectiveDate,
            runTerminationPayroll,
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_TERMINATION_CREATED, {
        termination: result.termination,
        payrollOption,
        runTerminationPayroll,
      })

      onEvent(componentEvents.EMPLOYEE_TERMINATION_DONE, {
        employeeId,
        effectiveDate,
        payrollOption,
        termination: result.termination,
        ...(payrollOption === 'anotherWay' && { manualHandling: true }),
      })
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  return (
    <EmployeeTerminationsPresentation
      employeeName={employeeName}
      lastDayOfWork={lastDayOfWork}
      onLastDayOfWorkChange={setLastDayOfWork}
      payrollOption={payrollOption}
      onPayrollOptionChange={setPayrollOption}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isPending}
      lastDayError={lastDayError}
      payrollOptionError={payrollOptionError}
    />
  )
}
