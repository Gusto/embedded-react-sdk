import { action } from '@ladle/react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { I18nextProvider } from 'react-i18next'
import { ContractorProfileForm, type ContractorProfileFormProps } from './ContractorProfileForm'
import { ContractorType, WageType, type ContractorProfileFormData } from './useContractorProfile'
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
  const formMethods = useForm({
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
  const mockHandleSubmit = action('handleSubmit')
  const mockFormState = {
    isSubmitting: false,
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isValidating: false,
    isValid: true,
    disabled: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: {},
    isReady: true,
  }

  const mockData: Omit<ContractorProfileFormProps, 'formMethods' | 'className'> = {
    handleSubmit: () => {
      mockHandleSubmit()
      return Promise.resolve()
    },
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
    watchedType,
    watchedWageType,
    watchedInviteContractor,
    isCreating: false,
    isUpdating: false,
    existingContractor: undefined,
    ContractorType,
    WageType,
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
