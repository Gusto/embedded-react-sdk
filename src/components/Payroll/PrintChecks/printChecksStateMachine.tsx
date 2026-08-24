import type { PrintChecksContextInterface } from './PrintChecksComponents'
import {
  PrintChecksFormContextual,
  PrintChecksFailureContextual,
  PrintChecksSummaryContextual,
} from './PrintChecksComponents'
import { state, transition, reduce } from '@/lib/state-machine'
import { printChecksEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * Payload shapes for each print-checks state machine event.
 *
 * @internal
 */
export type EventPayloads = {
  /** Banner CTA pressed to begin the print-checks flow. */
  [printChecksEvents.PRINT_CHECKS_START]: undefined
  /** Form submitted; a generate-and-poll cycle has started. */
  [printChecksEvents.PRINT_CHECKS_GENERATE_START]: undefined
  /** Generation succeeded; carries the generated checks document URL. */
  [printChecksEvents.PRINT_CHECKS_GENERATE_SUCCEEDED]: {
    documentUrl: string | null
  }
  /** Generation failed; carries the error message to surface. */
  [printChecksEvents.PRINT_CHECKS_GENERATE_FAILED]: {
    errorMessage: string | null
  }
  /** User retried after a failure. */
  [printChecksEvents.PRINT_CHECKS_RETRY]: undefined
  /** Form cancelled. */
  [printChecksEvents.PRINT_CHECKS_CANCEL]: undefined
  /** Failure or summary screen closed. */
  [printChecksEvents.PRINT_CHECKS_CLOSE]: undefined
}

/** @internal */
export const printChecksMachine = {
  banner: state<MachineTransition>(
    transition(
      printChecksEvents.PRINT_CHECKS_START,
      'form',
      reduce((ctx: PrintChecksContextInterface): PrintChecksContextInterface => ({
        ...ctx,
        component: PrintChecksFormContextual,
      })),
    ),
  ),
  form: state<MachineTransition>(
    transition(
      printChecksEvents.PRINT_CHECKS_GENERATE_START,
      'form',
      reduce((ctx: PrintChecksContextInterface): PrintChecksContextInterface => ({
        ...ctx,
        isGenerating: true,
      })),
    ),
    transition(
      printChecksEvents.PRINT_CHECKS_GENERATE_SUCCEEDED,
      'summary',
      reduce(
        (
          ctx: PrintChecksContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof printChecksEvents.PRINT_CHECKS_GENERATE_SUCCEEDED
          >,
        ): PrintChecksContextInterface => ({
          ...ctx,
          component: PrintChecksSummaryContextual,
          documentUrl: ev.payload.documentUrl ?? undefined,
          isGenerating: false,
        }),
      ),
    ),
    transition(
      printChecksEvents.PRINT_CHECKS_GENERATE_FAILED,
      'failure',
      reduce(
        (
          ctx: PrintChecksContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof printChecksEvents.PRINT_CHECKS_GENERATE_FAILED
          >,
        ): PrintChecksContextInterface => ({
          ...ctx,
          component: PrintChecksFailureContextual,
          errorMessage: ev.payload.errorMessage ?? undefined,
          isGenerating: false,
        }),
      ),
    ),
    transition(
      printChecksEvents.PRINT_CHECKS_CANCEL,
      'banner',
      reduce((ctx: PrintChecksContextInterface): PrintChecksContextInterface => ({
        ...ctx,
        component: null,
        isGenerating: false,
      })),
    ),
  ),
  failure: state<MachineTransition>(
    transition(
      printChecksEvents.PRINT_CHECKS_RETRY,
      'form',
      reduce((ctx: PrintChecksContextInterface): PrintChecksContextInterface => ({
        ...ctx,
        component: PrintChecksFormContextual,
        errorMessage: undefined,
      })),
    ),
    transition(
      printChecksEvents.PRINT_CHECKS_CLOSE,
      'banner',
      reduce((ctx: PrintChecksContextInterface): PrintChecksContextInterface => ({
        ...ctx,
        component: null,
        errorMessage: undefined,
      })),
    ),
  ),
  summary: state<MachineTransition>(
    transition(
      printChecksEvents.PRINT_CHECKS_CLOSE,
      'banner',
      reduce((ctx: PrintChecksContextInterface): PrintChecksContextInterface => ({
        ...ctx,
        component: null,
        documentUrl: undefined,
      })),
    ),
  ),
}
