import { fn } from 'storybook/test'
import type { TaxRequirementStatesList } from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { StateTaxesListPresentation } from './StateTaxesListPresentation'

export default {
  title: 'Domain/Company/StateTax/StateTaxesList',
}

const mockStateTaxRequirements: TaxRequirementStatesList[] = [
  {
    state: 'CA',
    setupComplete: true,
    setupStatus: 'complete',
  },
  {
    state: 'WA',
    setupComplete: false,
    setupStatus: 'in_progress',
  },
  {
    state: 'NY',
    setupComplete: true,
    setupStatus: 'complete',
  },
  {
    state: 'GA',
    setupComplete: false,
    setupStatus: 'not_started',
  },
]

export const Default = () => (
  <StateTaxesListPresentation
    stateTaxRequirements={mockStateTaxRequirements}
    handleContinue={fn().mockName('handleContinue')}
    handleChange={fn().mockName('handleChange')}
  />
)

export const AllComplete = () => (
  <StateTaxesListPresentation
    stateTaxRequirements={mockStateTaxRequirements.map(req => ({
      ...req,
      setupComplete: true,
      setupStatus: 'complete' as const,
    }))}
    handleContinue={fn().mockName('handleContinue')}
    handleChange={fn().mockName('handleChange')}
  />
)

export const AllIncomplete = () => (
  <StateTaxesListPresentation
    stateTaxRequirements={mockStateTaxRequirements.map(req => ({
      ...req,
      setupComplete: false,
      setupStatus: 'not_started' as const,
    }))}
    handleContinue={fn().mockName('handleContinue')}
    handleChange={fn().mockName('handleChange')}
  />
)

export const SingleState = () => (
  <StateTaxesListPresentation
    stateTaxRequirements={[mockStateTaxRequirements[0]!]}
    handleContinue={fn().mockName('handleContinue')}
    handleChange={fn().mockName('handleChange')}
  />
)

export const EmptyState = () => (
  <StateTaxesListPresentation
    stateTaxRequirements={[]}
    handleContinue={fn().mockName('handleContinue')}
    handleChange={fn().mockName('handleChange')}
  />
)
