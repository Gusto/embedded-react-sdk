import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { calculateGrossPay } from '../helpers'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { componentEvents } from '@/shared/constants'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'
import { useBase } from '@/components/Base/useBase'

// TODO: Replace this hook with call to Speakeasy instead
const useEditEmployeeApi = ({ employeeId }: { employeeId: string }) => {
  const mutate = async () => {}
  return { mutate }
}

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

  const { mutate } = useEditEmployeeApi({ employeeId })

  const employee = employeeData.employee!

  const employeeCompensation = preparedPayroll?.employeeCompensations?.find(
    compensation => compensation.employeeUuid === employeeId,
  )

  const onSave = async () => {
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED)
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
