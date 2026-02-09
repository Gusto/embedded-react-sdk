import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface OffCycleFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
}

export interface OffCycleFlowProps {
  companyId: string
  onEvent: (type: string, data?: unknown) => void
}
