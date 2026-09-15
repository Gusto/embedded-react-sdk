import { transition, reduce, state } from 'robot3'
import {
  contractorCreateTransition,
  contractorUpdateTransition,
  createContractorOnboardingSteps,
} from '../OnboardingFlow/onboardingStateMachine'
import {
  ContractorListContextual,
  DashboardFlowContextual,
  type ContractorListFlowContextInterface,
} from './ContractorListFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.CONTRACTOR_VIEW]: { contractorId: string }
}

const backToListHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'backToListCta',
    namespace: 'Contractor.ManagementContractorList',
    event: componentEvents.CONTRACTOR_RETURN_TO_LIST,
  },
}

const returnToList = reduce(
  (ctx: ContractorListFlowContextInterface): ContractorListFlowContextInterface => ({
    ...ctx,
    component: ContractorListContextual,
    header: null,
    contractorId: undefined,
  }),
)

/** @internal */
export const contractorListStateMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_VIEW,
      'dashboard',
      reduce(
        (
          ctx: ContractorListFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_VIEW>,
        ): ContractorListFlowContextInterface => ({
          ...ctx,
          component: DashboardFlowContextual,
          header: backToListHeader,
          contractorId: ev.payload.contractorId,
        }),
      ),
    ),
    contractorCreateTransition,
    contractorUpdateTransition,
  ),
  dashboard: state<MachineTransition>(
    transition(componentEvents.CONTRACTOR_RETURN_TO_LIST, 'list', returnToList),
  ),
  // Spreads in the same Profile → Address → Payment Method → New Hire Report → Submit states
  // ContractorOnboarding.OnboardingFlow uses, rather than mounting that flow as a nested
  // component — see createContractorOnboardingSteps' own doc comment for why. Every
  // 'list'-targeting transition inside these states (cancel, submit-done) resolves against
  // this machine's own `list` state above, since state names resolve against whichever
  // machine they end up spread into.
  //
  // waitForExplicitSubmitDone: true because this list (unlike OnboardingFlow's own) has no
  // success-banner mechanism — without it, an admin completing onboarding would be swept back
  // to the list the instant they click Submit, with no confirmation at all.
  ...createContractorOnboardingSteps(ContractorListContextual, { waitForExplicitSubmitDone: true }),
}
