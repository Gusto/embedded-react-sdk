import { transition, reduce, state } from 'robot3'
import {
  // ContractorListContextual,
  ProfileContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'

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
      'final',
      reduce(createReducer({ component: ProfileContextual, currentStep: 1, showProgress: true })),
    ),
    transition(componentEvents.COMPANY_OVERVIEW_DONE, 'final'),
  ),

  final: state(),
}
