import { reduce, state, transition } from 'robot3'
import {
  EditCompensationContextual,
  JobsListContextual,
  type CompensationFlowContextInterface,
  type EventPayloads,
} from './CompensationFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * `EMPLOYEE_COMPENSATION_DONE` deliberately has no transition out of `initialEditJob` or
 * `viewJobs`. `Flow` re-emits every event to the upstream `onEvent` regardless of whether the
 * local machine has a matching transition, so the parent flow still advances/unmounts this
 * component on that signal. Modeling completion as a robot3 final state instead left `component`
 * pointing at a step whose controls could never fire another transition — if a host doesn't
 * unmount immediately, the screen would look interactive but be permanently dead (SDK-1169).
 * Staying put means a host that keeps this component mounted past completion keeps a fully
 * working jobs list instead.
 *
 * @internal
 */
export const compensationStateMachine = {
  initialEditJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST,
      'viewJobs',
      reduce((ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
        ...ctx,
        component: JobsListContextual,
        currentJobId: null,
      })),
    ),
  ),
  viewJobs: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_JOB_ADD,
      'editJob',
      reduce((ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
        ...ctx,
        component: EditCompensationContextual,
        currentJobId: null,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_JOB_EDIT,
      'editJob',
      reduce(
        (
          ctx: CompensationFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_JOB_EDIT>,
        ): CompensationFlowContextInterface => ({
          ...ctx,
          component: EditCompensationContextual,
          currentJobId: ev.payload.uuid,
        }),
      ),
    ),
  ),
  editJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST,
      'viewJobs',
      reduce((ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
        ...ctx,
        component: JobsListContextual,
        currentJobId: null,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_CANCEL,
      'viewJobs',
      reduce((ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
        ...ctx,
        component: JobsListContextual,
        currentJobId: null,
      })),
    ),
  ),
}
