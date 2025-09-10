import { action } from '@ladle/react'
import { I18nextProvider } from 'react-i18next'
import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { ContractorProfileForm } from './ContractorProfileForm'
import { ContractorType, WageType, useContractorProfile } from './useContractorProfile'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { SDKI18next } from '@/contexts/GustoProvider/SDKI18next'

export default {
  title: 'Domain/Contractor/Profile',
}

// Interactive story component using the actual hook
function InteractiveStory({
  initialValues = {},
  existingContractor,
}: {
  initialValues?: Record<string, unknown>
  existingContractor?: Contractor
}) {
  // Use the actual hook with mock company ID
  const contractorProfileData = useContractorProfile({
    companyId: 'mock-company-id',
    defaultValues: initialValues,
    existingContractor,
  })

  // Override the handleSubmit to use action for stories
  const mockSubmitAction = action('form submitted')
  const handleSubmit = contractorProfileData.formMethods.handleSubmit(data => {
    mockSubmitAction(data)
  })

  return (
    <I18nextProvider i18n={SDKI18next}>
      <LocaleProvider locale="en-US" currency="USD">
        <ThemeProvider>
          <ContractorProfileForm
            {...contractorProfileData}
            handleSubmit={handleSubmit}
            existingContractor={existingContractor}
          />
        </ThemeProvider>
      </LocaleProvider>
    </I18nextProvider>
  )
}

// Default empty form state
export const Default = () => <InteractiveStory />

// Invite + Individual + Hourly
export const InviteIndividualHourly = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: true,
      contractorType: ContractorType.Individual,
      wageType: WageType.Hourly,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      hourlyRate: 50,
      startDate: new Date('2024-02-15'),
    }}
  />
)

// Invite + Individual + Fixed
export const InviteIndividualFixed = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: true,
      contractorType: ContractorType.Individual,
      wageType: WageType.Fixed,
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      startDate: new Date('2024-03-01'),
    }}
  />
)

// Invite + Business + Hourly
export const InviteBusinessHourly = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: true,
      contractorType: ContractorType.Business,
      wageType: WageType.Hourly,
      email: 'contact@acmecorp.com',
      businessName: 'Acme Consulting LLC',
      ein: '12-3456789',
      hourlyRate: 125,
      startDate: new Date('2024-01-22'),
    }}
  />
)

// Invite + Business + Fixed
export const InviteBusinessFixed = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: true,
      contractorType: ContractorType.Business,
      wageType: WageType.Fixed,
      email: 'billing@techsolutions.com',
      businessName: 'Tech Solutions Inc',
      ein: '98-7654321',
      startDate: new Date('2024-04-10'),
    }}
  />
)

// No Invite + Individual + Hourly
export const NoInviteIndividualHourly = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: false,
      contractorType: ContractorType.Individual,
      wageType: WageType.Hourly,
      firstName: 'Michael',
      lastName: 'Johnson',
      middleInitial: 'R',
      ssn: '123-45-6789',
      hourlyRate: 75,
      startDate: new Date('2024-02-05'),
    }}
  />
)

// No Invite + Individual + Fixed
export const NoInviteIndividualFixed = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: false,
      contractorType: ContractorType.Individual,
      wageType: WageType.Fixed,
      firstName: 'Sarah',
      lastName: 'Williams',
      ssn: '987-65-4321',
      startDate: new Date('2024-03-18'),
    }}
  />
)

// No Invite + Business + Hourly
export const NoInviteBusinessHourly = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: false,
      contractorType: ContractorType.Business,
      wageType: WageType.Hourly,
      businessName: 'Design Studio Pro',
      ein: '55-9876543',
      hourlyRate: 95,
      startDate: new Date('2024-01-08'),
    }}
  />
)

// No Invite + Business + Fixed
export const NoInviteBusinessFixed = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: false,
      contractorType: ContractorType.Business,
      wageType: WageType.Fixed,
      businessName: 'Marketing Experts Corp',
      ein: '44-1234567',
      startDate: new Date('2024-04-01'),
    }}
  />
)

// === TESTING VALIDATION ERRORS ===
// To test validation errors:
// 1. Use any of the above stories
// 2. Clear required fields (firstName, lastName, etc.)
// 3. Enter invalid formats (SSN: 123-45-678, EIN: 12-345)
// 4. Try to submit the form to see validation messages

// Example: Empty Individual Contractor for Error Testing
export const EmptyIndividualForErrorTesting = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: false,
      contractorType: ContractorType.Individual,
      wageType: WageType.Hourly,
      firstName: '',
      lastName: '',
      ssn: '',
      hourlyRate: undefined,
    }}
  />
)

// Example: Empty Business Contractor for Error Testing
export const EmptyBusinessForErrorTesting = () => (
  <InteractiveStory
    initialValues={{
      selfOnboarding: false,
      contractorType: ContractorType.Business,
      wageType: WageType.Hourly,
      businessName: '',
      ein: '',
      hourlyRate: undefined,
    }}
  />
)
