import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useForm, FormProvider } from 'react-hook-form'
import React from 'react'
import {
  useContractorProfile,
  ContractorType,
  WageType,
  createContractorProfileValidationSchema,
} from './useContractorProfile'
import { server } from '@/test/mocks/server'
import {
  handleCreateContractor,
  handleUpdateContractor,
  handleGetContractor,
} from '@/test/mocks/apis/contractors'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

// Mock the useBase hook
vi.mock('@/components/Base', () => ({
  useBase: () => ({
    onEvent: vi.fn(),
    baseSubmitHandler: vi.fn((data: unknown, callback: (data: unknown) => unknown) =>
      callback(data),
    ),
    fieldErrors: [],
    setError: vi.fn(),
    throwError: vi.fn(),
  }),
}))

// Mock i18n hooks
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
  defaultNS: 'common',
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      resolvedLanguage: 'en',
      addResourceBundle: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Test wrapper component that combines both form and API providers
const TestWrapper = ({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode
  defaultValues?: Record<string, unknown>
}) => {
  const methods = useForm({ defaultValues })

  // Set the form values after the form is created
  React.useEffect(() => {
    Object.entries(defaultValues).forEach(([key, value]) => {
      methods.setValue(key, value)
    })
  }, [defaultValues, methods])

  return (
    <GustoTestProvider>
      <FormProvider {...methods}>{children}</FormProvider>
    </GustoTestProvider>
  )
}

describe('useContractorProfile', () => {
  const defaultProps = {
    companyId: 'test-company-id',
    contractorId: undefined,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()

    // Set up default MSW handlers
    server.use(
      handleCreateContractor(() =>
        HttpResponse.json(
          {
            uuid: 'new-contractor-123',
            version: '1.0',
            type: 'Business',
            wage_type: 'Fixed',
            start_date: '2024-01-01',
            business_name: 'Test Business',
            ein: '12-3456789',
            is_active: true,
            file_new_hire_report: false,
          },
          { status: 201 },
        ),
      ),
      handleUpdateContractor(() =>
        HttpResponse.json({
          uuid: 'existing-contractor-123',
          version: '1.1',
          type: 'Individual',
          wage_type: 'Hourly',
          start_date: '2024-01-01',
          first_name: 'John',
          last_name: 'Doe',
          hourly_rate: '25.50',
          is_active: true,
          file_new_hire_report: false,
        }),
      ),
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'existing-contractor-123',
          version: '1.0',
          type: 'Individual',
          wage_type: 'Hourly',
          start_date: '2024-01-01',
          first_name: 'John',
          last_name: 'Doe',
          hourly_rate: '25.50',
          is_active: true,
          file_new_hire_report: false,
        }),
      ),
    )
  })

  describe('Initial State', () => {
    it('should initialize with default values for employer-led onboarding', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.shouldShowEmailField).toBe(false)
      expect(result.current.shouldShowBusinessFields).toBe(true)
      expect(result.current.shouldShowIndividualFields).toBe(false)
      expect(result.current.shouldShowHourlyRate).toBe(false)
      expect(result.current.isEditing).toBe(false)
    })
  })

  describe('Field Visibility Logic', () => {
    it('should show business fields when contractor type is Business', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => (
          <TestWrapper defaultValues={{ contractorType: ContractorType.Business }}>
            {children}
          </TestWrapper>
        ),
      })

      expect(result.current.shouldShowBusinessFields).toBe(true)
      expect(result.current.shouldShowIndividualFields).toBe(false)
    })

    it('should show individual fields when contractor type is Individual', () => {
      const { result } = renderHook(
        () =>
          useContractorProfile({
            ...defaultProps,
            defaultValues: { contractorType: ContractorType.Individual },
          }),
        {
          wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
        },
      )

      expect(result.current.shouldShowBusinessFields).toBe(false)
      expect(result.current.shouldShowIndividualFields).toBe(true)
    })

    it('should show hourly rate when wage type is Hourly', () => {
      const { result } = renderHook(
        () =>
          useContractorProfile({
            ...defaultProps,
            defaultValues: { wageType: WageType.Hourly },
          }),
        {
          wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
        },
      )

      expect(result.current.shouldShowHourlyRate).toBe(true)
    })

    it('should hide hourly rate when wage type is Fixed', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => (
          <TestWrapper defaultValues={{ wageType: WageType.Fixed }}>{children}</TestWrapper>
        ),
      })

      expect(result.current.shouldShowHourlyRate).toBe(false)
    })

    it('should show email field when invite contractor is true', () => {
      const { result } = renderHook(
        () =>
          useContractorProfile({
            ...defaultProps,
            defaultValues: { selfOnboarding: true },
          }),
        {
          wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
        },
      )

      expect(result.current.shouldShowEmailField).toBe(true)
    })

    it('should hide email field when invite contractor is false', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => (
          <TestWrapper defaultValues={{ selfOnboarding: false }}>{children}</TestWrapper>
        ),
      })

      expect(result.current.shouldShowEmailField).toBe(false)
    })

    describe('SSN Field Visibility', () => {
      it('should show SSN field for individual contractor when self-onboarding is disabled', () => {
        const { result } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Individual,
                selfOnboarding: false,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        expect(result.current.shouldShowSsnField).toBe(true)
      })

      it('should hide SSN field for individual contractor when self-onboarding is enabled', () => {
        const { result } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Individual,
                selfOnboarding: true,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        expect(result.current.shouldShowSsnField).toBe(false)
      })

      it('should hide SSN field for business contractor regardless of self-onboarding', () => {
        const { result: resultWithSelfOnboarding } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Business,
                selfOnboarding: true,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        const { result: resultWithoutSelfOnboarding } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Business,
                selfOnboarding: false,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        expect(resultWithSelfOnboarding.current.shouldShowSsnField).toBe(false)
        expect(resultWithoutSelfOnboarding.current.shouldShowSsnField).toBe(false)
      })
    })

    describe('EIN Field Visibility', () => {
      it('should show EIN field for business contractor when self-onboarding is disabled', () => {
        const { result } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Business,
                selfOnboarding: false,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        expect(result.current.shouldShowEinField).toBe(true)
      })

      it('should hide EIN field for business contractor when self-onboarding is enabled', () => {
        const { result } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Business,
                selfOnboarding: true,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        expect(result.current.shouldShowEinField).toBe(false)
      })

      it('should hide EIN field for individual contractor regardless of self-onboarding', () => {
        const { result: resultWithSelfOnboarding } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Individual,
                selfOnboarding: true,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        const { result: resultWithoutSelfOnboarding } = renderHook(
          () =>
            useContractorProfile({
              ...defaultProps,
              defaultValues: {
                contractorType: ContractorType.Individual,
                selfOnboarding: false,
              },
            }),
          {
            wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
          },
        )

        expect(resultWithSelfOnboarding.current.shouldShowEinField).toBe(false)
        expect(resultWithoutSelfOnboarding.current.shouldShowEinField).toBe(false)
      })
    })
  })

  describe('Editing Mode', () => {
    it('should be in editing mode when contractorId is provided', () => {
      const { result } = renderHook(
        () => useContractorProfile({ ...defaultProps, contractorId: 'existing-contractor-id' }),
        {
          wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
        },
      )

      expect(result.current.isEditing).toBe(true)
    })

    it('should not be in editing mode when contractorId is not provided', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.isEditing).toBe(false)
    })
  })

  describe('Form Methods', () => {
    it('should provide form methods', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.formMethods).toBeDefined()
      expect(result.current.formMethods.control).toBeDefined()
      expect(result.current.formMethods.handleSubmit).toBeDefined()
      expect(result.current.formMethods.formState).toBeDefined()
    })

    it('should provide submit and cancel handlers', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.handleSubmit).toBeDefined()
    })
  })

  describe('Form State', () => {
    it('should provide form state', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.formState).toBeDefined()
      expect(result.current.formState.isSubmitting).toBeDefined()
    })
  })

  describe('Form Validation with Self-Onboarding', () => {
    it('should require SSN for individual contractor when self-onboarding is disabled and contractor has no SSN', () => {
      // Test the validation schema directly
      const validationSchema = createContractorProfileValidationSchema(
        (key: string) => key, // Mock translation function
        false, // hasSsn = false (no existing contractor)
        false, // hasEin = false
      )

      const invalidData = {
        contractorType: ContractorType.Individual,
        selfOnboarding: false,
        firstName: 'John',
        lastName: 'Doe',
        wageType: WageType.Fixed,
        startDate: new Date(),
        // ssn is missing - should cause validation error
      }

      const result = validationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        const ssnError = result.error.errors.find(err => err.path.includes('ssn'))
        expect(ssnError).toBeDefined()
        expect(ssnError?.message).toBe('validations.ssn')
      }
    })

    it('should not require SSN for individual contractor when self-onboarding is enabled', async () => {
      const { result } = renderHook(
        () =>
          useContractorProfile({
            ...defaultProps,
            defaultValues: {
              contractorType: ContractorType.Individual,
              selfOnboarding: true,
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              wageType: WageType.Fixed,
              startDate: new Date(),
            },
            existingContractor: undefined,
          }),
        {
          wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
        },
      )

      const { formMethods } = result.current

      // Trigger validation - should be valid without SSN when self-onboarding
      const isValid = await formMethods.trigger()
      expect(isValid).toBe(true)

      const errors = formMethods.formState.errors
      expect(errors.ssn).toBeUndefined()
    })

    it('should require EIN for business contractor when self-onboarding is disabled and contractor has no EIN', () => {
      // Test the validation schema directly
      const validationSchema = createContractorProfileValidationSchema(
        (key: string) => key, // Mock translation function
        false, // hasSsn = false
        false, // hasEin = false (no existing contractor)
      )

      const invalidData = {
        contractorType: ContractorType.Business,
        selfOnboarding: false,
        businessName: 'Test Business',
        wageType: WageType.Fixed,
        startDate: new Date(),
        // ein is missing - should cause validation error
      }

      const result = validationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        const einError = result.error.errors.find(err => err.path.includes('ein'))
        expect(einError).toBeDefined()
        expect(einError?.message).toBe('validations.ein')
      }
    })

    it('should not require EIN for business contractor when self-onboarding is enabled', async () => {
      const { result } = renderHook(
        () =>
          useContractorProfile({
            ...defaultProps,
            defaultValues: {
              contractorType: ContractorType.Business,
              selfOnboarding: true,
              email: 'test@example.com',
              businessName: 'Test Business',
              wageType: WageType.Fixed,
              startDate: new Date(),
            },
            existingContractor: undefined,
          }),
        {
          wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
        },
      )

      const { formMethods } = result.current

      // Trigger validation - should be valid without EIN when self-onboarding
      const isValid = await formMethods.trigger()
      expect(isValid).toBe(true)

      const errors = formMethods.formState.errors
      expect(errors.ein).toBeUndefined()
    })

    it('should not require SSN/EIN when existing contractor already has them', async () => {
      const existingContractorWithSsn = {
        uuid: 'test-contractor',
        version: '1.0',
        type: ContractorType.Individual,
        firstName: 'John',
        lastName: 'Doe',
        hasSsn: true,
        hasEin: false,
        wageType: WageType.Fixed,
        startDate: '2024-01-01',
        isActive: true,
      }

      const { result } = renderHook(
        () =>
          useContractorProfile({
            ...defaultProps,
            contractorId: 'test-contractor',
            existingContractor: existingContractorWithSsn,
            defaultValues: {
              contractorType: ContractorType.Individual,
              selfOnboarding: false,
              firstName: 'John',
              lastName: 'Doe',
              wageType: WageType.Fixed,
              startDate: new Date(),
            },
          }),
        {
          wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
        },
      )

      const { formMethods } = result.current

      // Should be valid without SSN field filled because existing contractor already has SSN
      const isValid = await formMethods.trigger()
      expect(isValid).toBe(true)

      const errors = formMethods.formState.errors
      expect(errors.ssn).toBeUndefined()
    })
  })
})
