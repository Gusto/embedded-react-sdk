import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { ProfileContextInterface } from './ProfileComponents'
import { CardContextual, ProfileEditFormContextual } from './ProfileComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce(
  (ctx: ProfileContextInterface): ProfileContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
    successAlert: null,
  }),
)

const returnToCardWithAlert = (alert: ProfileContextInterface['successAlert']) =>
  reduce(
    (ctx: ProfileContextInterface): ProfileContextInterface => ({
      ...ctx,
      component: CardContextual as ComponentType,
      successAlert: alert,
    }),
  )

export const profileStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED,
      'editProfile',
      reduce(
        (ctx: ProfileContextInterface): ProfileContextInterface => ({
          ...ctx,
          component: ProfileEditFormContextual as ComponentType,
          successAlert: null,
        }),
      ),
    ),
    transition(componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_ALERT_DISMISSED, 'card', returnToCard),
  ),
  editProfile: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_UPDATED,
      'card',
      returnToCardWithAlert('profileUpdated'),
    ),
    transition(componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED, 'card', returnToCard),
  ),
}
