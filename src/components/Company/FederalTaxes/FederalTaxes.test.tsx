import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { useFederalTaxDetailsGetSuspense } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import { useFederalTaxDetailsUpdateMutation } from '@gusto/embedded-api/react-query/federalTaxDetailsUpdate'
import {
  TaxPayerType,
  FilingForm,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { type GetV1CompaniesCompanyIdFederalTaxDetailsResponse } from '@gusto/embedded-api/models/operations/getv1companiescompanyidfederaltaxdetails'
import { type PutV1CompaniesCompanyIdFederalTaxDetailsResponse } from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { type UseMutationResult } from '@tanstack/react-query'
import { FederalTaxes } from './FederalTaxes'

vi.mock('@gusto/embedded-api/react-query/federalTaxDetailsGet')
vi.mock('@gusto/embedded-api/react-query/federalTaxDetailsUpdate')

const mockUseFederalTaxDetailsGet = vi.mocked(useFederalTaxDetailsGetSuspense)
const mockUseFederalTaxDetailsUpdateMutation = vi.mocked(useFederalTaxDetailsUpdateMutation)

const defaultFederalTaxDetails: GetV1CompaniesCompanyIdFederalTaxDetailsResponse = {
  federalTaxDetails: {
    hasEin: false,
    taxPayerType: TaxPayerType.CCorporation,
    filingForm: FilingForm.NineHundredAndFortyOne,
    legalName: 'Test Company',
    version: '1',
  },
  httpMeta: {
    request: 'test-request',
    response_time: 100,
  },
}

const mockOnEvent = vi.fn()

describe('FederalTaxes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseFederalTaxDetailsGet.mockReturnValue({
      data: defaultFederalTaxDetails,
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
      status: 'success',
      isFetching: false,
      isRefetching: false,
      isStale: false,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
    })

    const mockMutation: UseMutationResult = {
      mutateAsync: vi.fn().mockResolvedValue({
        federalTaxDetails: defaultFederalTaxDetails.federalTaxDetails,
        httpMeta: defaultFederalTaxDetails.httpMeta,
      }),
      isPending: false,
      isError: false,
      isSuccess: true,
      isIdle: false,
      status: 'success',
      data: defaultFederalTaxDetails,
      error: null,
      mutate: vi.fn(),
      reset: vi.fn(),
      variables: {
        request: {
          companyId: '123',
          requestBody: defaultFederalTaxDetails.federalTaxDetails,
        },
      },
      failureCount: 0,
      failureReason: null,
    }

    mockUseFederalTaxDetailsUpdateMutation.mockReturnValue(mockMutation)
  })

  test('renders with default values', () => {
    render(<FederalTaxes companyId="123" onEvent={mockOnEvent} />)

    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue(TaxPayerType.CCorporation)).toBeInTheDocument()
    expect(screen.getByDisplayValue(FilingForm.NineHundredAndFortyOne)).toBeInTheDocument()
  })

  test('renders with provided default values', () => {
    const customDefaultValues = {
      taxPayerType: TaxPayerType.SCorporation,
      filingForm: FilingForm.NineHundredAndFortyFour,
      legalName: 'Custom Company',
    }

    render(
      <FederalTaxes companyId="123" onEvent={mockOnEvent} defaultValues={customDefaultValues} />,
    )

    expect(screen.getByDisplayValue('Custom Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue(TaxPayerType.SCorporation)).toBeInTheDocument()
    expect(screen.getByDisplayValue(FilingForm.NineHundredAndFortyFour)).toBeInTheDocument()
  })

  test('submits form with correct values and fires events', async () => {
    const user = userEvent.setup()
    const updatedFederalTaxDetails: PutV1CompaniesCompanyIdFederalTaxDetailsResponse = {
      federalTaxDetails: {
        ...defaultFederalTaxDetails.federalTaxDetails,
        legalName: 'Updated Company',
      },
      httpMeta: defaultFederalTaxDetails.httpMeta,
    }

    const mockMutateAsync = vi.fn().mockResolvedValue(updatedFederalTaxDetails)

    const mockMutation: UseMutationResult = {
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: true,
      isIdle: false,
      status: 'success',
      data: updatedFederalTaxDetails,
      error: null,
      mutate: vi.fn(),
      reset: vi.fn(),
      variables: {
        request: {
          companyId: '123',
          requestBody: updatedFederalTaxDetails.federalTaxDetails,
        },
      },
      failureCount: 0,
      failureReason: null,
    }

    mockUseFederalTaxDetailsUpdateMutation.mockReturnValue(mockMutation)

    render(<FederalTaxes companyId="123" onEvent={mockOnEvent} />)

    const legalNameInput = screen.getByDisplayValue('Test Company')
    await user.clear(legalNameInput)
    await user.type(legalNameInput, 'Updated Company')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    expect(mockMutateAsync).toHaveBeenCalledWith({
      request: {
        companyId: '123',
        requestBody: {
          ein: '',
          taxPayerType: TaxPayerType.CCorporation,
          filingForm: FilingForm.NineHundredAndFortyOne,
          legalName: 'Updated Company',
          version: '1',
        },
      },
    })

    expect(mockOnEvent).toHaveBeenCalledWith(
      'COMPANY_FEDERAL_TAXES_UPDATED',
      updatedFederalTaxDetails.federalTaxDetails,
    )
    expect(mockOnEvent).toHaveBeenCalledWith('COMPANY_FEDERAL_TAXES_DONE')
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockMutation: UseMutationResult = {
      mutateAsync: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      isPending: true,
      isError: false,
      isSuccess: false,
      isIdle: false,
      status: 'pending',
      data: null,
      error: null,
      mutate: vi.fn(),
      reset: vi.fn(),
      variables: {
        request: {
          companyId: '123',
          requestBody: defaultFederalTaxDetails.federalTaxDetails,
        },
      },
      failureCount: 0,
      failureReason: null,
    }

    mockUseFederalTaxDetailsUpdateMutation.mockReturnValue(mockMutation)

    render(<FederalTaxes companyId="123" onEvent={mockOnEvent} />)

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
