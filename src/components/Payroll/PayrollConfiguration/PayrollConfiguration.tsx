import type { ReactNode } from 'react'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import { usePayrollConfiguration } from './usePayrollConfiguration'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'

interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  companyId: string
  payrollId: string
  alerts?: ReactNode
  withReimbursements?: boolean
}

export function PayrollConfiguration(props: PayrollConfigurationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  onEvent,
  companyId,
  payrollId,
  dictionary,
  alerts,
  withReimbursements = true,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)

  const { data, actions, meta, pagination } = usePayrollConfiguration({
    companyId,
    payrollId,
    onEvent,
    alerts,
    withReimbursements,
  })

  return (
    <PayrollConfigurationPresentation {...data} {...actions} {...meta} pagination={pagination} />
  )
}
