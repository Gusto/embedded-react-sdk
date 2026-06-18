import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorOnboardingCompleteDemo } from './ContractorOnboardingCompleteStates'

export const contractorOnboardingCompleteConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'default',
    name: 'Default',
    description: 'Final confirmation screen with a Done button.',
    render: () => <ContractorOnboardingCompleteDemo />,
  },
]
