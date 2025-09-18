import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { calculateGrossPay } from '../helpers'
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
}: PayrollEditEmployeeProps) => {
  useComponentDictionary('Payroll.PayrollEditEmployee', dictionary)

  const { LoadingIndicator } = useBase()

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { preparedPayroll, paySchedule, isLoading } = usePreparedPayrollData({
    companyId,
    payrollId,
  })

  const { mutateAsync: updatePayroll, isPending } = usePayrollsUpdateMutation()

  const employee = employeeData.employee!

  const employeeCompensation = preparedPayroll?.employeeCompensations?.find(
    compensation => compensation.employeeUuid === employeeId,
  )

  const transformEmployeeCompensation = ({
    paymentMethod,
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
      grossPay={
        employeeCompensation
          ? calculateGrossPay(
              employeeCompensation,
              employee,
              preparedPayroll?.payPeriod?.startDate,
              paySchedule,
              preparedPayroll?.offCycle,
            )
          : 0
      }
      employeeCompensation={employeeCompensation}
    />
  )
}
