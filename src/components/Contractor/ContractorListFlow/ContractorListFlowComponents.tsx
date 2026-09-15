import { ManagementContractorList } from '../ContractorList/management/ManagementContractorList'
import { DashboardFlow } from '../Dashboard'
import { type OnboardingFlowContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { useFlow } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link ContractorListFlow}.
 *
 * @public
 */
export interface ContractorListFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

// Extends OnboardingFlowContextInterface (rather than FlowContextInterface directly) so this
// machine's context is shape-compatible with the shared contractor-onboarding step states it
// spreads in from onboardingStateMachine.ts (see createContractorOnboardingSteps) — those
// states' reducers and Contextual components (ProfileContextual, AddressContextual, etc.) are
// typed against OnboardingFlowContextInterface.
/** @internal */
export type ContractorListFlowContextInterface = OnboardingFlowContextInterface

/** @internal */
export function ContractorListContextual() {
  const { companyId, onEvent } = useFlow<ContractorListFlowContextInterface>()
  return <ManagementContractorList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function DashboardFlowContextual() {
  const { contractorId, onEvent } = useFlow<ContractorListFlowContextInterface>()
  return <DashboardFlow contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}
