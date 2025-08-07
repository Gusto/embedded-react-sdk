import { transition, reduce, state } from 'robot3'
import {
  AddressContextual,
  NewHireReportContextual,
  PaymentMethodContextual,
  ProfileContextual,
  SubmitContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_UPDATE]: {
    contractorId: string
  }
}

const createReducer = (props: Partial<OnboardingFlowContextInterface>) => {
  return (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}
export const onboardingMachine = {
  list: state(
    transition(
      componentEvents.CONTRACTOR_CREATE,
      'profile',
      reduce(
        createReducer({
          component: ProfileContextual,
          currentStep: 1,
          showProgress: true,
          contractorId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_UPDATE,
      'profile',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_UPDATE>,
        ): OnboardingFlowContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            currentStep: 1,
            showProgress: true,
            contractorId: ev.payload.contractorId,
          }
        },
      ),
    ),
  ),
  profile: state(
    transition(
      componentEvents.CONTRACTOR_PROFILE_DONE,
      'address',
      reduce(createReducer({ component: AddressContextual, currentStep: 2 })),
    ),
  ),
  address: state(
    transition(
      componentEvents.CONTRACTOR_ADDRESS_DONE,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual, currentStep: 3 })),
    ),
  ),
  paymentMethod: state(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'newHireReport',
      reduce(
        createReducer({
          component: NewHireReportContextual,
          currentStep: 4,
        }),
      ),
    ),
  ),
  newHireReport: state(
    transition(
      componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE,
      'submit',
      reduce(
        createReducer({
          component: SubmitContextual,
          currentStep: 5,
        }),
      ),
    ),
  ),
  submit: state(
    transition(
      componentEvents.CONTRACTOR_SUBMIT_DONE,
      'final',
      reduce(createReducer({ component: undefined, currentStep: 0, showProgress: false })),
    ),
  ),
  final: state(),
}
