import { state, transition, reduce } from 'robot3'
import type { ConfirmationAlert } from './types'
import type { ConfirmWireDetailsContextInterface } from './ConfirmWireDetailsComponents'
import {
  WireInstructionsContextual,
  ConfirmWireDetailsFormContextual,
} from './ConfirmWireDetailsComponents'
import { payrollWireEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * Payload shapes for each wire-confirmation state machine event.
 *
 * @internal
 */
export type EventPayloads = {
  /** Wire-in request selected within the instructions screen. */
  [payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT]: {
    selectedWireInId: string
  }
  /** Banner button pressed to begin the wire transfer flow. */
  [payrollWireEvents.PAYROLL_WIRE_START_TRANSFER]: undefined
  /** Instructions screen completed; advances to the confirmation form. */
  [payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE]: {
    selectedWireInId: string
  }
  /** Confirmation form submitted; carries the alert to surface on the banner. */
  [payrollWireEvents.PAYROLL_WIRE_FORM_DONE]: {
    confirmationAlert: ConfirmationAlert
  }
  /** Confirmation form cancelled. */
  [payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL]: undefined
}

/** @internal */
export const confirmWireDetailsMachine = {
  banner: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_START_TRANSFER,
      'wireInstructions',
      reduce((ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
        ...ctx,
        component: WireInstructionsContextual,
      })),
    ),
  ),
  wireInstructions: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT,
      'wireInstructions',
      reduce(
        (
          ctx: ConfirmWireDetailsContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_SELECT
          >,
        ): ConfirmWireDetailsContextInterface => ({
          ...ctx,
          selectedWireInId: ev.payload.selectedWireInId,
        }),
      ),
    ),
    transition(
      payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE,
      'confirmForm',
      reduce(
        (
          ctx: ConfirmWireDetailsContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE
          >,
        ): ConfirmWireDetailsContextInterface => ({
          ...ctx,
          component: ConfirmWireDetailsFormContextual,
          selectedWireInId: ev.payload.selectedWireInId,
        }),
      ),
    ),
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL,
      'banner',
      reduce((ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
        ...ctx,
      })),
    ),
  ),
  confirmForm: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_DONE,
      'banner',
      reduce(
        (
          ctx: ConfirmWireDetailsContextInterface,
          ev: MachineEventType<EventPayloads, typeof payrollWireEvents.PAYROLL_WIRE_FORM_DONE>,
        ): ConfirmWireDetailsContextInterface => ({
          ...ctx,
          component: null,
          confirmationAlert: ev.payload.confirmationAlert,
        }),
      ),
    ),
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL,
      'banner',
      reduce((ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
        ...ctx,
        component: null,
      })),
    ),
  ),
  final: state<MachineTransition>(),
}
