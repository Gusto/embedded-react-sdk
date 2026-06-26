import { fn } from 'storybook/test'
import { ContractorProfile } from './ContractorProfile'
import type { ContractorDetailsFormData } from './shared/useContractorDetailsForm'

export default {
  title: 'Domain/Contractor/Profile',
}

const companyId = 'mock-company-id'

function Story({ defaultValues }: { defaultValues?: Partial<ContractorDetailsFormData> }) {
  return <ContractorProfile companyId={companyId} onEvent={fn()} defaultValues={defaultValues} />
}

// Default empty form state
export const Default = () => <Story />

// Invite + Individual + Hourly
export const InviteIndividualHourly = () => (
  <Story
    defaultValues={{
      selfOnboarding: true,
      type: 'Individual',
      wageType: 'Hourly',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      hourlyRate: 50,
      startDate: '2024-02-15',
    }}
  />
)

// Invite + Individual + Fixed
export const InviteIndividualFixed = () => (
  <Story
    defaultValues={{
      selfOnboarding: true,
      type: 'Individual',
      wageType: 'Fixed',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      startDate: '2024-03-01',
    }}
  />
)

// Invite + Business + Hourly
export const InviteBusinessHourly = () => (
  <Story
    defaultValues={{
      selfOnboarding: true,
      type: 'Business',
      wageType: 'Hourly',
      email: 'contact@acmecorp.com',
      businessName: 'Acme Consulting LLC',
      ein: '12-3456789',
      hourlyRate: 125,
      startDate: '2024-01-22',
    }}
  />
)

// Invite + Business + Fixed
export const InviteBusinessFixed = () => (
  <Story
    defaultValues={{
      selfOnboarding: true,
      type: 'Business',
      wageType: 'Fixed',
      email: 'billing@techsolutions.com',
      businessName: 'Tech Solutions Inc',
      ein: '98-7654321',
      startDate: '2024-04-10',
    }}
  />
)

// No Invite + Individual + Hourly
export const NoInviteIndividualHourly = () => (
  <Story
    defaultValues={{
      selfOnboarding: false,
      type: 'Individual',
      wageType: 'Hourly',
      firstName: 'Michael',
      lastName: 'Johnson',
      middleInitial: 'R',
      ssn: '123-45-6789',
      hourlyRate: 75,
      startDate: '2024-02-05',
    }}
  />
)

// No Invite + Individual + Fixed
export const NoInviteIndividualFixed = () => (
  <Story
    defaultValues={{
      selfOnboarding: false,
      type: 'Individual',
      wageType: 'Fixed',
      firstName: 'Sarah',
      lastName: 'Williams',
      ssn: '987-65-4321',
      startDate: '2024-03-18',
    }}
  />
)

// No Invite + Business + Hourly
export const NoInviteBusinessHourly = () => (
  <Story
    defaultValues={{
      selfOnboarding: false,
      type: 'Business',
      wageType: 'Hourly',
      businessName: 'Design Studio Pro',
      ein: '55-9876543',
      hourlyRate: 95,
      startDate: '2024-01-08',
    }}
  />
)

// No Invite + Business + Fixed
export const NoInviteBusinessFixed = () => (
  <Story
    defaultValues={{
      selfOnboarding: false,
      type: 'Business',
      wageType: 'Fixed',
      businessName: 'Marketing Experts Corp',
      ein: '44-1234567',
      startDate: '2024-04-01',
    }}
  />
)
