import { reduce, state, state as final, transition } from 'robot3'
import {
  EditCompensationContextual,
  JobsListContextual,
  type CompensationFlowContextInterface,
  type EventPayloads,
} from './CompensationFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

export const compensationStateMachine = {
  initialEditJob: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_COMPENSATION_DONE, 'done'),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST,
      'viewJobs',
      reduce(
        (ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
          ...ctx,
          component: JobsListContextual,
          currentJobId: null,
        }),
      ),
    ),
  ),
  viewJobs: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_JOB_ADD,
      'editJob',
      reduce(
        (ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
          ...ctx,
          component: EditCompensationContextual,
          currentJobId: null,
        }),
      ),
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
    transition(componentEvents.EMPLOYEE_COMPENSATION_DONE, 'done'),
  ),
  editJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_RETURN_TO_LIST,
      'viewJobs',
      reduce(
        (ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
          ...ctx,
          component: JobsListContextual,
          currentJobId: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_CANCEL,
      'viewJobs',
      reduce(
        (ctx: CompensationFlowContextInterface): CompensationFlowContextInterface => ({
          ...ctx,
          component: JobsListContextual,
          currentJobId: null,
        }),
      ),
    ),
  ),
  done: final(),
}
