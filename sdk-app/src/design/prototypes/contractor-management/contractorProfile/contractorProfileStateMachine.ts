import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { ContractorProfileContextInterface } from './ContractorProfileComponents'
import {
  ProfileViewContextual,
  EditAddressContextual,
  AddPaymentMethodContextual,
  EditPaymentMethodContextual,
  EditCompensationContextual,
  EditBasicDetailsContextual,
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

const toEditWithTab = (component: ComponentType, selectedTab: string) =>
  reduce(
    (ctx: ContractorProfileContextInterface): ContractorProfileContextInterface => ({
      ...ctx,
      component,
      successMessage: undefined,
      selectedTab,
    }),
  )

export const contractorProfileStateMachine = {
  profile: state<MachineTransition>(
    transition(
      'contractor/address/edit',
      'editAddress',
      toEditWithTab(EditAddressContextual, 'basic-details'),
    ),
    transition(
      'contractor/paymentMethod/add',
      'addPaymentMethod',
      toEditWithTab(AddPaymentMethodContextual, 'pay'),
    ),
    transition(
      'contractor/paymentMethod/edit',
      'editPaymentMethod',
      toEditWithTab(EditPaymentMethodContextual, 'pay'),
    ),
    transition(
      'contractor/paymentMethod/removed',
      'profile',
      toProfileWithMessage('Payment method updated to Check'),
    ),
    transition(
      'contractor/details/edit',
      'editBasicDetails',
      toEditWithTab(EditBasicDetailsContextual, 'basic-details'),
    ),
    transition(
      'contractor/compensation/edit',
      'editCompensation',
      toEditWithTab(EditCompensationContextual, 'pay'),
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
      toProfileWithMessage('Payment method updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfile),
  ),
  editPaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED,
      'profile',
      toProfileWithMessage('Payment method updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfile),
  ),
  editBasicDetails: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_UPDATED,
      'profile',
      toProfileWithMessage('Contractor details updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfile),
  ),
  editCompensation: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_UPDATED,
      'profile',
      toProfileWithMessage('Compensation updated successfully'),
    ),
    transition(componentEvents.CANCEL, 'profile', toProfile),
  ),
}
