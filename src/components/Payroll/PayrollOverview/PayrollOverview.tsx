import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import {
  ConfirmWireDetails,
  type ConfirmWireDetailsComponentType,
} from '../ConfirmWireDetails/ConfirmWireDetails'
import { usePayrollOverview } from './usePayrollOverview'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n'

interface PayrollOverviewProps extends BaseComponentInterface<'Payroll.PayrollOverview'> {
  companyId: string
  payrollId: string
  alerts?: PayrollFlowAlert[]
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
}

export function PayrollOverview(props: PayrollOverviewProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  companyId,
  payrollId,
  dictionary,
  onEvent,
  alerts,
  withReimbursements = true,
  ConfirmWireDetailsComponent = ConfirmWireDetails,
}: PayrollOverviewProps) => {
  useComponentDictionary('Payroll.PayrollOverview', dictionary)

  const { data, actions, meta } = usePayrollOverview({
    companyId,
    payrollId,
    onEvent,
    alerts,
    withReimbursements,
  })

  const wireInConfirmationRequest = data.wireInId && (
    <ConfirmWireDetailsComponent
      companyId={companyId}
      wireInId={data.wireInId}
      onEvent={actions.handleWireEvent}
    />
  )

  return (
    <PayrollOverviewPresentation
      {...data}
      {...actions}
      {...meta}
      wireInConfirmationRequest={wireInConfirmationRequest}
    />
  )
}
