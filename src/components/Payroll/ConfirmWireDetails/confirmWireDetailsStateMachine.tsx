import { state, transition, reduce } from 'robot3'
import type { ConfirmWireDetailsContextInterface } from './ConfirmWireDetailsComponents'
import {
  WireInstructionsContextual,
  ConfirmWireDetailsFormContextual,
} from './ConfirmWireDetailsComponents'
import { payrollWireEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

export type EventPayloads = {
  [payrollWireEvents.PAYROLL_WIRE_START_TRANSFER]: undefined
  [payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE]: undefined
  [payrollWireEvents.PAYROLL_WIRE_FORM_DONE]: undefined
  [payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL]: undefined
  [payrollWireEvents.PAYROLL_WIRE_COMPLETED]: undefined
}

export const confirmWireDetailsMachine = {
  banner: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_START_TRANSFER,
      'wireInstructions',
      reduce(
        (ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
          ...ctx,
          component: WireInstructionsContextual,
        }),
      ),
    ),
  ),
  wireInstructions: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_DONE,
      'confirmForm',
      reduce(
        (ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
          ...ctx,
          component: ConfirmWireDetailsFormContextual,
        }),
      ),
    ),
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL,
      'banner',
      reduce(
        (ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
          ...ctx,
        }),
      ),
    ),
  ),
  confirmForm: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_DONE,
      'banner',
      reduce(
        (ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
          ...ctx,
        }),
      ),
    ),
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL,
      'banner',
      reduce(
        (ctx: ConfirmWireDetailsContextInterface): ConfirmWireDetailsContextInterface => ({
          ...ctx,
        }),
      ),
    ),
  ),
  final: state<MachineTransition>(),
}
