import type { PayScheduleDefaultValues } from './PaySchedule'
import { PayScheduleList } from './PayScheduleList'
import { PayScheduleForm } from './PayScheduleForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface PayScheduleContextInterface extends FlowContextInterface {
  companyId: string
  payScheduleId?: string
  defaultValues?: PayScheduleDefaultValues
  component: React.ComponentType | null
}

export function PayScheduleListContextual() {
  const { companyId, onEvent } = useFlow<PayScheduleContextInterface>()
  return <PayScheduleList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function PayScheduleFormContextual() {
  const { companyId, payScheduleId, defaultValues, onEvent } =
    useFlow<PayScheduleContextInterface>()

  return (
    <PayScheduleForm
      companyId={ensureRequired(companyId)}
      payScheduleId={payScheduleId}
      defaultValues={defaultValues}
      onEvent={onEvent}
    />
  )
}
