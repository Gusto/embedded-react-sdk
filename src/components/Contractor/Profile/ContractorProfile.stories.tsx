import { action } from '@ladle/react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { I18nextProvider } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { ContractorProfileForm, type ContractorProfileFormProps } from './ContractorProfileForm'
import {
  ContractorType,
  WageType,
  type ContractorProfileFormData,
  createContractorProfileValidationSchema,
} from './useContractorProfile'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { SDKI18next } from '@/contexts/GustoProvider/SDKI18next'

export default {
  title: 'Domain/Contractor/Profile',
}

// Interactive story component that replicates the hook's conditional logic
function InteractiveStory({
  initialValues = {},
  isEditing = false,
}: {
  initialValues?: Record<string, unknown>
  isEditing?: boolean
}) {
  // Create validation schema for stories (with mock translation)
  const validationSchema = createContractorProfileValidationSchema((key: string) => key)

  const formMethods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      inviteContractor: false,
      contractorType: ContractorType.Individual,
      wageType: WageType.Hourly,
      startDate: new Date(),
      ...initialValues,
    },
  })

  // Watch form values for conditional rendering (same as real hook)
  const watchedType = useWatch({
    control: formMethods.control,
    name: 'contractorType',
  }) as (typeof ContractorType)[keyof typeof ContractorType]
  const watchedWageType = useWatch({
    control: formMethods.control,
    name: 'wageType',
  }) as (typeof WageType)[keyof typeof WageType]
  const watchedInviteContractor = useWatch({
    control: formMethods.control,
    name: 'inviteContractor',
  })

  // Conditional rendering helpers (same logic as real hook)
  const shouldShowEmailField = Boolean(watchedInviteContractor)
  const shouldShowBusinessFields = watchedType === ContractorType.Business
  const shouldShowIndividualFields = watchedType === ContractorType.Individual
  const shouldShowHourlyRate = watchedWageType === WageType.Hourly

  // Base mock data that matches the hook's return type
  const mockSubmitAction = action('form submitted')
  const mockFormState = {
    ...formMethods.formState,
    isSubmitting: false,
  }

  const mockData: Omit<ContractorProfileFormProps, 'formMethods' | 'className'> = {
    handleSubmit: formMethods.handleSubmit(data => {
      mockSubmitAction(data)
    }),
    formState: mockFormState,
    handleCancel: action('handleCancel'),
    contractorTypeOptions: [
      { label: 'Individual', value: ContractorType.Individual },
      { label: 'Business', value: ContractorType.Business },
    ],
    wageTypeOptions: [
      { label: 'Hourly', value: WageType.Hourly },
      { label: 'Fixed', value: WageType.Fixed },
    ],
    isEditing,
    shouldShowEmailField,
    shouldShowBusinessFields,
    shouldShowIndividualFields,
    shouldShowHourlyRate,
  }

  return (
    <I18nextProvider i18n={SDKI18next}>
      <LocaleProvider locale="en-US" currency="USD">
        <ThemeProvider>
          <ContractorProfileForm
            {...mockData}
            formMethods={formMethods as UseFormReturn<ContractorProfileFormData>}
            shouldShowEmailField={shouldShowEmailField}
            shouldShowBusinessFields={shouldShowBusinessFields}
            shouldShowIndividualFields={shouldShowIndividualFields}
            shouldShowHourlyRate={shouldShowHourlyRate}
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
      inviteContractor: true,
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
      inviteContractor: true,
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
      inviteContractor: true,
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
      inviteContractor: true,
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
      inviteContractor: false,
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
      inviteContractor: false,
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
      inviteContractor: false,
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
      inviteContractor: false,
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
      inviteContractor: false,
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
      inviteContractor: false,
      contractorType: ContractorType.Business,
      wageType: WageType.Hourly,
      businessName: '',
      ein: '',
      hourlyRate: undefined,
    }}
  />
)
