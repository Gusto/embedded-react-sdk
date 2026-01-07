import { state, transition, reduce } from 'robot3'
import type { RecoveryCasesContextInterface } from './RecoveryCasesComponents'
import { RecoveryCasesResubmitContextual } from './RecoveryCasesComponents'
import { recoveryCasesEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

export type EventPayloads = {
  [recoveryCasesEvents.RECOVERY_CASE_RESOLVE]: {
    recoveryCaseId: string
  }
  [recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL]: undefined
  [recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE]: undefined
}

export const recoveryCasesMachine = {
  list: state<MachineTransition>(
    transition(
      recoveryCasesEvents.RECOVERY_CASE_RESOLVE,
      'resubmit',
      reduce(
        (
          ctx: RecoveryCasesContextInterface,
          ev: MachineEventType<EventPayloads, typeof recoveryCasesEvents.RECOVERY_CASE_RESOLVE>,
        ): RecoveryCasesContextInterface => ({
          ...ctx,
          component: RecoveryCasesResubmitContextual,
          selectedRecoveryCaseId: ev.payload.recoveryCaseId,
        }),
      ),
    ),
  ),
  resubmit: state<MachineTransition>(
    transition(
      recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE,
      'list',
      reduce(
        (ctx: RecoveryCasesContextInterface): RecoveryCasesContextInterface => ({
          ...ctx,
          component: null,
          selectedRecoveryCaseId: undefined,
        }),
      ),
    ),
    transition(
      recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL,
      'list',
      reduce(
        (ctx: RecoveryCasesContextInterface): RecoveryCasesContextInterface => ({
          ...ctx,
          component: null,
          selectedRecoveryCaseId: undefined,
        }),
      ),
    ),
  ),
  final: state<MachineTransition>(),
}
