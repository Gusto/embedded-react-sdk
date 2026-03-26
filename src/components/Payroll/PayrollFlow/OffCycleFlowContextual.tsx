import { OffCycleFlow } from '../OffCycle'
import type { PayrollFlowContextInterface } from './PayrollFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export function OffCycleFlowContextual() {
  const { companyId, onEvent, withReimbursements } = useFlow<PayrollFlowContextInterface>()
  return (
    <OffCycleFlow
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      withReimbursements={withReimbursements}
    />
  )
}
