import { PayScheduleForm } from '../PayScheduleForm'
import type { PayScheduleDefaultValues } from '../PaySchedule'
import { PayScheduleOverview } from './PayScheduleOverview'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface PayScheduleManagementContextInterface extends FlowContextInterface {
  companyId: string
  payScheduleId?: string
  defaultValues?: PayScheduleDefaultValues
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
  component: React.ComponentType | null
}

/** @internal */
export function PayScheduleOverviewContextual() {
  const { companyId, onEvent, enableAutoPilot, enableMultipleSchedules } =
    useFlow<PayScheduleManagementContextInterface>()
  return (
    <PayScheduleOverview
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      enableAutoPilot={enableAutoPilot}
      enableMultipleSchedules={enableMultipleSchedules}
    />
  )
}

/** @internal */
export function PayScheduleEditFormContextual() {
  const { companyId, payScheduleId, defaultValues, onEvent } =
    useFlow<PayScheduleManagementContextInterface>()

  return (
    <PayScheduleForm
      companyId={ensureRequired(companyId)}
      payScheduleId={payScheduleId}
      defaultValues={defaultValues}
      onEvent={onEvent}
    />
  )
}
