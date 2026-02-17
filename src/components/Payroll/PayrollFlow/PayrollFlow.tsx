import type { PayrollFlowProps } from './PayrollFlowComponents'
import { usePayrollFlow } from './usePayrollFlow'
import { Flow } from '@/components/Flow/Flow'

export const PayrollFlow = ({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => {
  const {
    meta: { machine },
  } = usePayrollFlow({ companyId, withReimbursements, ConfirmWireDetailsComponent })

  return <Flow machine={machine} onEvent={onEvent} />
}
