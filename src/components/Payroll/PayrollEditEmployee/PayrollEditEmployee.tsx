import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { componentEvents } from '@/shared/constants'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'

// TODO: Replace this hook with call to Speakeasy instead
const useEditEmployeeApi = ({ employeeId }: { employeeId: string }) => {
  const mutate = async () => {}
  return { mutate }
}

interface PayrollEditEmployeeProps extends BaseComponentInterface<'Payroll.PayrollEditEmployee'> {
  employeeId: string
  payrollId: string
  companyId: string
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
  payrollId,
  companyId,
  onEvent,
  dictionary,
}: PayrollEditEmployeeProps) => {
  useComponentDictionary('Payroll.PayrollEditEmployee', dictionary)

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId })
  const { data: payrollData } = usePayrollsGetSuspense({ companyId, payrollId })

  const employee = employeeData.employee!
  const employeeCompensations = payrollData.payrollShow?.employeeCompensations || []

  // Find the employee compensation that matches this employee
  const employeeCompensation = employeeCompensations.find(
    compensation => compensation.employeeUuid === employeeId,
  )

  if (!employeeCompensation) {
    throw new Error(`Employee compensation not found for employee ${employeeId}`)
  }

  const { mutate } = useEditEmployeeApi({ employeeId })
  const onDone = async () => {
    await mutate()
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED)
  }

  return (
    <PayrollEditEmployeePresentation
      onDone={onDone}
      employee={employee}
      employeeCompensation={employeeCompensation}
    />
  )
}
