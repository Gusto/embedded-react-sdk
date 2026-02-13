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

  const hookResult = usePayrollOverview({
    companyId,
    payrollId,
    onEvent,
    alerts,
    withReimbursements,
  })

  const wireInConfirmationRequest = hookResult.wireInId && (
    <ConfirmWireDetailsComponent
      companyId={companyId}
      wireInId={hookResult.wireInId}
      onEvent={hookResult.handleWireEvent}
    />
  )

  return (
    <PayrollOverviewPresentation
      onEdit={hookResult.onEdit}
      onSubmit={hookResult.onSubmit}
      onCancel={hookResult.onCancel}
      onPayrollReceipt={hookResult.onPayrollReceipt}
      onPaystubDownload={hookResult.onPaystubDownload}
      status={hookResult.status}
      isProcessed={hookResult.isProcessed}
      canCancel={hookResult.canCancel}
      payrollData={hookResult.payrollData}
      bankAccount={hookResult.bankAccount}
      employeeDetails={hookResult.employeeDetails}
      taxes={hookResult.taxes}
      alerts={hookResult.alerts}
      submissionBlockers={hookResult.submissionBlockers}
      selectedUnblockOptions={hookResult.selectedUnblockOptions}
      onUnblockOptionChange={hookResult.onUnblockOptionChange}
      wireInConfirmationRequest={wireInConfirmationRequest}
      withReimbursements={hookResult.withReimbursements}
    />
  )
}
