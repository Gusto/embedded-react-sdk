import { ContractorOnboardingComplete } from './ContractorOnboardingComplete'

/**
 * Renders ContractorOnboardingComplete for state demos with a no-op
 * Done handler.
 */
export function ContractorOnboardingCompleteDemo() {
  return <ContractorOnboardingComplete onDone={() => {}} />
}
