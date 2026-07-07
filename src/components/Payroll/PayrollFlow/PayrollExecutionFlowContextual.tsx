import { Suspense } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { PayrollExecutionInternalFlow } from '../PayrollExecutionFlow/PayrollExecutionFlow'
import { isDismissalPayroll } from '../helpers'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { Loading } from '@/components/Common/Loading/Loading'

/** @internal */
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
    <Suspense fallback={<Loading />}>
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

type PayrollExecutionFlowWithDataProps = React.ComponentProps<typeof PayrollExecutionInternalFlow>

function PayrollExecutionFlowWithData({
  companyId,
  payrollId,
  ...rest
}: PayrollExecutionFlowWithDataProps) {
  const { data } = usePayrollsGetSuspense({ companyId, payrollId })
  const initialPayPeriod = data.payrollShow?.payPeriod

  return (
    <PayrollExecutionInternalFlow
      companyId={companyId}
      payrollId={payrollId}
      initialPayPeriod={initialPayPeriod}
      isDismissalPayroll={isDismissalPayroll(data.payrollShow?.offCycleReason)}
      {...rest}
    />
  )
}
