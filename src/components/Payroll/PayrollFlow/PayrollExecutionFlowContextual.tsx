import { Suspense } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
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

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <Suspense>
      <PayrollExecutionFlowWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        withReimbursements={withReimbursements}
        ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
        initialState={executionInitialState}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </Suspense>
  )
}

type PayrollExecutionFlowWithDataProps = React.ComponentProps<typeof PayrollExecutionFlow>

function PayrollExecutionFlowWithData({
  companyId,
  payrollId,
  ...rest
}: PayrollExecutionFlowWithDataProps) {
  const { data } = usePayrollsGetSuspense({ companyId, payrollId })
  const initialPayPeriod = data.payrollShow?.payPeriod

  return (
    <PayrollExecutionFlow
      companyId={companyId}
      payrollId={payrollId}
      initialPayPeriod={initialPayPeriod}
      {...rest}
    />
  )
}
