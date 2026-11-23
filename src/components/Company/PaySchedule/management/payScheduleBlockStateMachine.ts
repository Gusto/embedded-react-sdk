import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PayScheduleBlockContextInterface } from './PayScheduleComponents'
import {
  PaySchedulesCardContextual,
  PayScheduleEditScreenContextual,
} from './PayScheduleComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the pay schedule surface.
 *
 * @remarks
 * Uses this block's own `company/management/paySchedule/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. The surface's own machine transitions on bare `CANCEL` to return
 * its schedule form to the overview, and `Flow` re-emits that upward, so a `CANCEL` transition
 * here would close the whole block whenever a user backed out of editing one schedule.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.PaySchedule',
    event: componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_CANCELLED,
  },
}

/**
 * Card to the pay schedule surface and back.
 *
 * @remarks
 * The only block in the set with no save transition and no success alert. The surface is a hub
 * in its own right — its schedule form, employee assignment wizard and AutoPilot dialog each
 * return to its own overview and it shows its own alerts for each — so there is no completion
 * event to return on and nothing to defer to the card. The back header is the only way out,
 * which is exactly how the dashboard's pay schedule spoke already behaves.
 *
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const payScheduleBlockStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_REQUESTED,
      'paySchedule',
      reduce((ctx: PayScheduleBlockContextInterface): PayScheduleBlockContextInterface => ({
        ...ctx,
        component: PayScheduleEditScreenContextual as ComponentType,
        header: editHeader,
      })),
    ),
  ),
  paySchedule: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_CANCELLED,
      'card',
      reduce((ctx: PayScheduleBlockContextInterface): PayScheduleBlockContextInterface => ({
        ...ctx,
        component: PaySchedulesCardContextual as ComponentType,
        header: null,
      })),
    ),
  ),
}
