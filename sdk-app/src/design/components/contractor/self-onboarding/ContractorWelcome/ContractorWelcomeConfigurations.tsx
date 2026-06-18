import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { ContractorWelcomeDemo } from './ContractorWelcomeStates'

export const contractorWelcomeConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'individual',
    name: 'Individual contractor',
    description: 'Greeting personalized with the contractor’s first name.',
    render: () => <ContractorWelcomeDemo contractorName="Sasha" companyName="Acme Inc" />,
  },
  {
    slug: 'business',
    name: 'Business contractor',
    description: 'Greeting personalized with the business name.',
    render: () => (
      <ContractorWelcomeDemo contractorName="Pacific Design Co." companyName="Acme Inc" />
    ),
  },
  {
    slug: 'no-name',
    name: 'No contractor name on file',
    description: 'Fallback when the contractor record has neither firstName nor businessName.',
    render: () => <ContractorWelcomeDemo contractorName="there" companyName="Acme Inc" />,
  },
]
