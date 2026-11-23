import { PaySchedulesCard } from './PaySchedulesCard'
import { PayScheduleEditScreen } from './PayScheduleEditScreen'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface PayScheduleBlockContextInterface extends FlowContextInterface {
  companyId?: string
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
}

/**
 * The pay schedules card.
 *
 * @remarks
 * Renders no success alert of its own: the surface behind it is a hub that shows its own
 * alerts for each schedule, assignment and AutoPilot change, so there is nothing to defer to
 * the card.
 *
 * @internal
 */
export function PaySchedulesCardContextual() {
  const { companyId, onEvent, LoaderComponent } = useFlow<PayScheduleBlockContextInterface>()
  return (
    <PaySchedulesCard
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}

/** @internal */
export function PayScheduleEditScreenContextual() {
  const { companyId, onEvent, enableAutoPilot, enableMultipleSchedules } =
    useFlow<PayScheduleBlockContextInterface>()
  return (
    <PayScheduleEditScreen
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      enableAutoPilot={enableAutoPilot}
      enableMultipleSchedules={enableMultipleSchedules}
    />
  )
}
