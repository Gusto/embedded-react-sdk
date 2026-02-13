import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { usePayrollEditEmployee } from './usePayrollEditEmployee'
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

  const { LoadingIndicator } = useBase()

  const { isLoading, ...hookResult } = usePayrollEditEmployee({
    employeeId,
    companyId,
    payrollId,
    onEvent,
    withReimbursements,
  })

  if (isLoading) {
    return <LoadingIndicator />
  }

  return <PayrollEditEmployeePresentation {...hookResult} />
}
