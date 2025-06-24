import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useForm, FormProvider } from 'react-hook-form'
import React from 'react'
import { useContractorProfile, ContractorType, WageType } from './useContractorProfile'
import { server } from '@/test/mocks/server'
import {
  handleCreateContractor,
  handleUpdateContractor,
  handleGetContractor,
} from '@/test/mocks/apis/contractors'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

// Mock the useBase hook
vi.mock('@/components/Base', () => ({
  useBase: () => ({
    onEvent: vi.fn(),
    baseSubmitHandler: vi.fn((data, callback) => callback(data)),
    fieldErrors: [],
    setError: vi.fn(),
    throwError: vi.fn(),
  }),
}))

// Test wrapper component that combines both form and API providers
const TestWrapper = ({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode
  defaultValues?: any
}) => {
  const methods = useForm({ defaultValues })

  // Set the form values after the form is created
  React.useEffect(() => {
    Object.entries(defaultValues).forEach(([key, value]) => {
      methods.setValue(key as any, value)
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

    // Set up default MSW handlers
    server.use(
      handleCreateContractor(() =>
        HttpResponse.json(
          {
            contractor: {
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
          },
          { status: 201 },
        ),
      ),
      handleUpdateContractor(() =>
        HttpResponse.json({
          contractor: {
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
          },
        }),
      ),
      handleGetContractor(() =>
        HttpResponse.json({
          contractor: {
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
          },
        }),
      ),
    )
  })

  describe('Initial State', () => {
    it('should initialize with default values for employer-led onboarding', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.watchedType).toBe(ContractorType.Business)
      expect(result.current.watchedWageType).toBe(WageType.Fixed)
      expect(result.current.watchedInviteContractor).toBe(false)
      expect(result.current.shouldShowEmailField).toBe(false)
      expect(result.current.shouldShowBusinessFields).toBe(true)
      expect(result.current.shouldShowIndividualFields).toBe(false)
      expect(result.current.shouldShowHourlyRate).toBe(false)
      expect(result.current.isEditing).toBe(false)
      expect(result.current.isCreating).toBe(false)
      expect(result.current.isUpdating).toBe(false)
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
            defaultValues: { inviteContractor: true },
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
          <TestWrapper defaultValues={{ inviteContractor: false }}>{children}</TestWrapper>
        ),
      })

      expect(result.current.shouldShowEmailField).toBe(false)
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

  describe('Form Options', () => {
    it('should provide contractor type options', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.contractorTypeOptions).toEqual([
        { label: 'Individual', value: ContractorType.Individual },
        { label: 'Business', value: ContractorType.Business },
      ])
    })

    it('should provide wage type options', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.wageTypeOptions).toEqual([
        { label: 'Hourly', value: WageType.Hourly },
        { label: 'Fixed', value: WageType.Fixed },
      ])
    })
  })

  describe('Enum Access', () => {
    it('should provide access to ContractorType enum', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.ContractorType).toBe(ContractorType)
      expect(result.current.ContractorType.Individual).toBe('Individual')
      expect(result.current.ContractorType.Business).toBe('Business')
    })

    it('should provide access to WageType enum', () => {
      const { result } = renderHook(() => useContractorProfile(defaultProps), {
        wrapper: ({ children }) => <TestWrapper defaultValues={{}}>{children}</TestWrapper>,
      })

      expect(result.current.WageType).toBe(WageType)
      expect(result.current.WageType.Hourly).toBe('Hourly')
      expect(result.current.WageType.Fixed).toBe('Fixed')
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
      expect(result.current.handleCancel).toBeDefined()
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
})
