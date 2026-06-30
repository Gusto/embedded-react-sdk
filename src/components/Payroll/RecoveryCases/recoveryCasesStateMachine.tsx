import { state, transition, reduce } from 'robot3'
import type { RecoveryCasesContextInterface } from './RecoveryCasesComponents'
import { RecoveryCasesResubmitContextual } from './RecoveryCasesComponents'
import { recoveryCasesEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/** @internal */
export type EventPayloads = {
  /** Payload carried when a user opens the resubmit modal for a recovery case. */
  [recoveryCasesEvents.RECOVERY_CASE_RESOLVE]: {
    recoveryCaseId: string
  }
  /** No payload — the modal was cancelled. */
  [recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL]: undefined
  /** No payload — the resubmit completed successfully. */
  [recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE]: undefined
}

/** @internal */
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
      reduce((ctx: RecoveryCasesContextInterface): RecoveryCasesContextInterface => ({
        ...ctx,
        component: null,
        selectedRecoveryCaseId: undefined,
      })),
    ),
    transition(
      recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL,
      'list',
      reduce((ctx: RecoveryCasesContextInterface): RecoveryCasesContextInterface => ({
        ...ctx,
        component: null,
        selectedRecoveryCaseId: undefined,
      })),
    ),
  ),
  final: state<MachineTransition>(),
}
