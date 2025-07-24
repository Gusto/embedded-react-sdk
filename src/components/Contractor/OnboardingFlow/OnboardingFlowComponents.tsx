import { ContractorList } from '../ContractorList'
import { ContractorProfile } from '../Profile'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
// import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

// export type OnboardingFlowDefaultValues = RequireAtLeastOne<{
//   federalTaxes?: FederalTaxesDefaultValues
//   paySchedule?: PayScheduleDefaultValues
// }>
export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  // defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}
export interface OnboardingFlowContextInterface extends FlowContextInterface {
  companyId: string
  // defaultValues?: OnboardingFlowDefaultValues
}

export function ContractorListContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <ContractorList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function ProfileContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <ContractorProfile onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
