import { PayrollExecutionFlow } from '../PayrollExecutionFlow/PayrollExecutionFlow'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export function PayrollExecutionFlowContextual() {
  const {
    companyId,
    payrollUuid,
    onEvent,
    withReimbursements,
    ConfirmWireDetailsComponent,
    executionInitialState,
    breadcrumbs,
  } = useFlow<PayrollFlowContextInterface>()

  const landingBreadcrumb = breadcrumbs?.['landing']?.[0]
  const prefixBreadcrumbs = landingBreadcrumb ? [landingBreadcrumb] : undefined

  return (
    <PayrollExecutionFlow
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      onEvent={onEvent}
      withReimbursements={withReimbursements}
      ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
      initialState={executionInitialState}
      prefixBreadcrumbs={prefixBreadcrumbs}
    />
  )
}
