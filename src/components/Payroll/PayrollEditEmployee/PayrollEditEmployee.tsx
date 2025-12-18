import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { useMemo } from 'react'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { componentEvents } from '@/shared/constants'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'
import { useBase } from '@/components/Base/useBase'

interface PayrollEditEmployeeProps extends BaseComponentInterface<'Payroll.PayrollEditEmployee'> {
  employeeId: string
  companyId: string
  payrollId: string
  withReimbursements?: boolean
}

export function PayrollEditEmployee(props: PayrollEditEmployeeProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  employeeId,
  companyId,
  payrollId,
  onEvent,
  dictionary,
  withReimbursements = true,
}: PayrollEditEmployeeProps) => {
  useComponentDictionary('Payroll.PayrollEditEmployee', dictionary)

  const { LoadingIndicator, baseSubmitHandler } = useBase()

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const memoizedEmployeeId = useMemo(() => [employeeId], [])
  const { preparedPayroll, paySchedule, isLoading } = usePreparedPayrollData({
    companyId,
    payrollId,
    employeeUuids: memoizedEmployeeId,
  })

  const { mutateAsync: updatePayroll, isPending } = usePayrollsUpdateMutation()

  const employee = employeeData.employee!
  const employeeCompensation = preparedPayroll?.employeeCompensations?.at(0)

  const transformEmployeeCompensation = ({
    paymentMethod,
    reimbursements,
    ...compensation
  }: PayrollEmployeeCompensationsType): PayrollUpdateEmployeeCompensations => {
    return {
      ...compensation,
      ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
      memo: compensation.memo || undefined,
    }
  }

  const onSave = async (updatedCompensation: PayrollEmployeeCompensationsType) => {
    const transformedCompensation = transformEmployeeCompensation(updatedCompensation)
    await baseSubmitHandler(null, async () => {
      const result = await updatePayroll({
        request: {
          companyId,
          payrollId,
          payrollUpdate: {
            employeeCompensations: [transformedCompensation],
          },
        },
      })

      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
        payrollPrepared: result.payrollPrepared,
        employee,
      })
    })
  }

  const onCancel = () => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)
  }

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <PayrollEditEmployeePresentation
      onSave={onSave}
      onCancel={onCancel}
      employee={employee}
      isPending={isPending}
      employeeCompensation={employeeCompensation}
      fixedCompensationTypes={preparedPayroll?.fixedCompensationTypes || []}
      payPeriodStartDate={preparedPayroll?.payPeriod?.startDate}
      paySchedule={paySchedule}
      isOffCycle={preparedPayroll?.offCycle}
      withReimbursements={withReimbursements}
    />
  )
}
