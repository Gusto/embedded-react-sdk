import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { ContractorProfileContextInterface } from './ContractorProfileComponents'
import {
  ProfileViewContextual,
  EditAddressContextual,
  AddPaymentMethodContextual,
  EditPaymentMethodContextual,
} from './ContractorProfileComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const toProfile = reduce(
  (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
    ...ctx,
    component: ProfileViewContextual as ComponentType,
    successMessage: undefined,
  }),
)

const toProfileWithMessage = (message: string) =>
  reduce(
    (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
      ...ctx,
      component: ProfileViewContextual as ComponentType,
      successMessage: message,
    }),
  )

const toProfilePay = reduce(
  (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
    ...ctx,
    component: ProfileViewContextual as ComponentType,
    successMessage: undefined,
    selectedTab: 'pay',
  }),
)

const toProfilePayWithMessage = (message: string) =>
  reduce(
    (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
      ...ctx,
      component: ProfileViewContextual as ComponentType,
      successMessage: message,
      selectedTab: 'pay',
    }),
  )

export const contractorProfileStateMachine = {
  profile: state<MachineTransition>(
    transition(
      'contractor/address/edit',
      'editAddress',
      reduce(
        (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
          ...ctx,
          component: EditAddressContextual as ComponentType,
          successMessage: undefined,
        }),
      ),
    ),
    transition(
      'contractor/paymentMethod/add',
      'addPaymentMethod',
      reduce(
        (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
          ...ctx,
          component: AddPaymentMethodContextual as ComponentType,
          successMessage: undefined,
        }),
      ),
    ),
    transition(
      'contractor/paymentMethod/edit',
      'editPaymentMethod',
      reduce(
        (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
          ...ctx,
          component: EditPaymentMethodContextual as ComponentType,
          successMessage: undefined,
        }),
      ),
    ),
    transition(
      'contractor/paymentMethod/removed',
      'profile',
      toProfilePayWithMessage('Payment method updated to Check'),
    ),
  ),
  editAddress: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_ADDRESS_UPDATED,
      'profile',
      toProfileWithMessage('Address updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfile),
  ),
  addPaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED,
      'profile',
      toProfilePayWithMessage('Payment method updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfilePay),
  ),
  editPaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED,
      'profile',
      toProfilePayWithMessage('Payment method updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfilePay),
  ),
}
