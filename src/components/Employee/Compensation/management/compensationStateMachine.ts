import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
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
    jobId: string
  }
}

const returnToCard = reduce(
  (ctx: CompensationContextInterface): CompensationContextInterface => ({
    ...ctx,
    component: CompensationCardContextual as ComponentType,
    successAlert: null,
    currentJobId: null,
  }),
)

const returnToCardWithAlert = (alert: CompensationContextInterface['successAlert']) =>
  reduce(
    (ctx: CompensationContextInterface): CompensationContextInterface => ({
      ...ctx,
      component: CompensationCardContextual as ComponentType,
      successAlert: alert,
      currentJobId: null,
    }),
  )

/** @internal */
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
          currentJobId: ev.payload.jobId,
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
          currentJobId: null,
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
          currentJobId: null,
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
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED,
      'card',
      returnToCard,
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
  addJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_SUBMITTED,
      'card',
      returnToCardWithAlert('jobAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_JOB_FORM_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
  addAnotherJob: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED,
      'card',
      returnToCardWithAlert('jobAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
