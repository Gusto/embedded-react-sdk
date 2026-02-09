import { CreateOffCyclePayroll } from '../CreateOffCyclePayroll/CreateOffCyclePayroll'
import { useFlow } from '@/components/Flow/useFlow'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface OffCycleFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
}

export interface OffCycleFlowProps {
  companyId: string
  onEvent: (type: string, data?: unknown) => void
}

export function CreateOffCyclePayrollContextual() {
  const { companyId, onEvent } = useFlow<OffCycleFlowContextInterface>()
  return <CreateOffCyclePayroll onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
