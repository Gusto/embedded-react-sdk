import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface OffCycleFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
}

export interface OffCycleFlowProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}
