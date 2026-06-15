import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { DeductionsContextInterface } from './DeductionsComponents'
import { DeductionsCardContextual, DeductionsEditFormContextual } from './DeductionsComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED]: Garnishment
}

const returnToCard = reduce(
  (ctx: DeductionsContextInterface): DeductionsContextInterface => ({
    ...ctx,
    component: DeductionsCardContextual as ComponentType,
    successAlert: null,
    editingDeductionId: undefined,
  }),
)

const returnToCardWithAlert = (alert: DeductionsContextInterface['successAlert']) =>
  reduce(
    (ctx: DeductionsContextInterface): DeductionsContextInterface => ({
      ...ctx,
      component: DeductionsCardContextual as ComponentType,
      successAlert: alert,
      editingDeductionId: undefined,
    }),
  )

/** @internal */
export const deductionsStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED,
      'editDeduction',
      reduce(
        (ctx: DeductionsContextInterface): DeductionsContextInterface => ({
          ...ctx,
          component: DeductionsEditFormContextual as ComponentType,
          successAlert: null,
          editingDeductionId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED,
      'editDeduction',
      reduce(
        (
          ctx: DeductionsContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED
          >,
        ): DeductionsContextInterface => ({
          ...ctx,
          component: DeductionsEditFormContextual as ComponentType,
          successAlert: null,
          editingDeductionId: ev.payload.uuid,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED,
      'card',
      returnToCardWithAlert('deductionDeleted'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_ALERT_DISMISSED,
      'card',
      returnToCard,
    ),
  ),
  editDeduction: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED,
      'card',
      returnToCardWithAlert('deductionAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED,
      'card',
      returnToCardWithAlert('deductionUpdated'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
