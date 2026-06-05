import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import type { CompensationContextInterface } from './CompensationComponents'
import {
  CompensationCardContextual,
  CompensationEditFormContextual,
  CompensationAddJobFormContextual,
  CompensationAddAnotherJobFormContextual,
} from './CompensationComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED]: {
    employeeId: string
    job: Job
  }
}

const returnToCard = reduce(
  (ctx: CompensationContextInterface): CompensationContextInterface => ({
    ...ctx,
    component: CompensationCardContextual as ComponentType,
    successAlert: null,
    currentJob: null,
  }),
)

const returnToCardWithAlert = (alert: CompensationContextInterface['successAlert']) =>
  reduce(
    (ctx: CompensationContextInterface): CompensationContextInterface => ({
      ...ctx,
      component: CompensationCardContextual as ComponentType,
      successAlert: alert,
      currentJob: null,
    }),
  )

export const compensationStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED,
      'editCompensation',
      reduce(
        (
          ctx: CompensationContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED
          >,
        ): CompensationContextInterface => ({
          ...ctx,
          component: CompensationEditFormContextual as ComponentType,
          currentJob: ev.payload.job,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_REQUESTED,
      'addJob',
      reduce(
        (ctx: CompensationContextInterface): CompensationContextInterface => ({
          ...ctx,
          component: CompensationAddJobFormContextual as ComponentType,
          currentJob: null,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_ANOTHER_REQUESTED,
      'addAnotherJob',
      reduce(
        (ctx: CompensationContextInterface): CompensationContextInterface => ({
          ...ctx,
          component: CompensationAddAnotherJobFormContextual as ComponentType,
          currentJob: null,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ALERT_DISMISSED,
      'card',
      returnToCard,
    ),
  ),
  editCompensation: state<MachineTransition>(
    transition(componentEvents.EMPLOYEE_COMPENSATION_DONE, 'card', returnToCard),
    transition(componentEvents.CANCEL, 'card', returnToCard),
  ),
  addJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
      'card',
      returnToCardWithAlert('jobAdded'),
    ),
    transition(componentEvents.CANCEL, 'card', returnToCard),
  ),
  addAnotherJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
      'card',
      returnToCardWithAlert('jobAdded'),
    ),
    transition(componentEvents.CANCEL, 'card', returnToCard),
  ),
}
