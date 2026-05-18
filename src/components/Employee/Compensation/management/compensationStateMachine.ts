import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import {
  AddJobContextual,
  EditCompensationContextual,
  ListViewContextual,
  type EventPayloads,
  type ManagementCompensationFlowContextInterface,
} from './CompensationFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type Ctx = ManagementCompensationFlowContextInterface

const toListView = (ctx: Ctx): Ctx => ({
  ...ctx,
  component: ListViewContextual as ComponentType,
  currentJobId: null,
  currentCompensationId: null,
})

export const managementCompensationStateMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_EDIT,
      'editCompensation',
      reduce(
        (
          ctx: Ctx,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_COMPENSATION_EDIT>,
        ): Ctx => ({
          ...ctx,
          component: EditCompensationContextual as ComponentType,
          currentJobId: ev.payload.jobId,
          currentCompensationId: ev.payload.compensationId,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_JOB_ADD,
      'addJob',
      reduce(
        (ctx: Ctx): Ctx => ({
          ...ctx,
          component: AddJobContextual as ComponentType,
          currentJobId: null,
          currentCompensationId: null,
        }),
      ),
    ),
  ),
  editCompensation: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, 'list', reduce(toListView)),
    transition(componentEvents.EMPLOYEE_COMPENSATION_CANCEL, 'list', reduce(toListView)),
  ),
  addJob: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_COMPENSATION_UPDATED, 'list', reduce(toListView)),
    transition(componentEvents.EMPLOYEE_COMPENSATION_CANCEL, 'list', reduce(toListView)),
  ),
}
