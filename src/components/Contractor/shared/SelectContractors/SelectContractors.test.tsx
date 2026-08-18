import { screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { SelectContractors } from './SelectContractors'
import { useSelectContractors } from './useSelectContractors'
import type { UseSelectContractorsReady, UseSelectContractorsResult } from './useSelectContractors'
import { buildContractorIndividual, buildContractorBusiness } from '@/test/factories/contractor'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import type { SDKError } from '@/types/sdkError'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

vi.mock('./useSelectContractors', () => ({
  useSelectContractors: vi.fn(),
}))

const mockUseSelectContractors = vi.mocked(useSelectContractors)

const pagination: PaginationControlProps = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 2,
  itemsPerPage: 25,
  handleFirstPage: vi.fn(),
  handlePreviousPage: vi.fn(),
  handleNextPage: vi.fn(),
  handleLastPage: vi.fn(),
  handleItemsPerPageChange: vi.fn(),
}

function readyResult(
  overrides: Partial<UseSelectContractorsReady> = {},
): UseSelectContractorsReady {
  return {
    isLoading: false,
    data: {
      contractors: [
        buildContractorIndividual({ uuid: '1', firstName: 'Alice' }),
        buildContractorBusiness({ uuid: '2', businessName: 'Acme LLC' }),
      ],
    },
    status: { isFetching: false },
    eligibleCount: 2,
    selectedIds: new Set<string>(),
    pagination,
    searchValue: '',
    actions: {
      onSelect: vi.fn(),
      onSelectAll: vi.fn(),
      onSearchChange: vi.fn(),
      onSearchClear: vi.fn(),
    },
    errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
    ...overrides,
  }
}

function renderComponent(
  onSelectionChange: (ids: string[]) => void = vi.fn(),
  overrides: { emptyStateTitle?: string; emptyStateDescription?: string } = {},
) {
  return renderWithProviders(
    <SelectContractors
      companyId="company-123"
      onSelectionChange={onSelectionChange}
      {...overrides}
    />,
  )
}

describe('SelectContractors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows the loading indicator while the hook is loading', () => {
    const loadingResult: UseSelectContractorsResult = {
      isLoading: true,
      errorHandling: { errors: [], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
    }
    mockUseSelectContractors.mockReturnValue(loadingResult)
    renderComponent()
    expect(screen.getByLabelText('Loading component...')).toBeInTheDocument()
  })

  test('renders eligible contractors once loaded', () => {
    mockUseSelectContractors.mockReturnValue(readyResult())
    renderComponent()
    expect(screen.getByText('Alice Test')).toBeInTheDocument()
    expect(screen.getByText('Acme LLC')).toBeInTheDocument()
  })

  test('calls onSelectionChange with the current selection on mount', () => {
    mockUseSelectContractors.mockReturnValue(readyResult({ selectedIds: new Set(['1']) }))
    const onSelectionChange = vi.fn()
    renderComponent(onSelectionChange)
    expect(onSelectionChange).toHaveBeenCalledOnce()
    expect(onSelectionChange).toHaveBeenCalledWith(['1'])
  })

  test('calls onSelectionChange again when the selection changes', () => {
    mockUseSelectContractors.mockReturnValue(readyResult({ selectedIds: new Set(['1']) }))
    const onSelectionChange = vi.fn()
    const { rerender } = renderComponent(onSelectionChange)

    mockUseSelectContractors.mockReturnValue(readyResult({ selectedIds: new Set(['1', '2']) }))
    rerender(<SelectContractors companyId="company-123" onSelectionChange={onSelectionChange} />)

    expect(onSelectionChange).toHaveBeenCalledTimes(2)
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2'])
  })

  // Regression guard: useSelectContractors recomputes `selectedIds` as a brand-new
  // Set every render, so the effect must key off content, not Set identity — otherwise
  // this fires (and can loop, if the parent setStates from onSelectionChange) on every render.
  test('does not call onSelectionChange again when selection contents are unchanged but the Set reference is new', () => {
    mockUseSelectContractors.mockReturnValue(readyResult({ selectedIds: new Set(['1']) }))
    const onSelectionChange = vi.fn()
    const { rerender } = renderComponent(onSelectionChange)
    expect(onSelectionChange).toHaveBeenCalledTimes(1)

    mockUseSelectContractors.mockReturnValue(readyResult({ selectedIds: new Set(['1']) }))
    rerender(<SelectContractors companyId="company-123" onSelectionChange={onSelectionChange} />)

    expect(onSelectionChange).toHaveBeenCalledTimes(1)
  })

  test('passes emptyStateTitle and emptyStateDescription through to the presentation', () => {
    mockUseSelectContractors.mockReturnValue(readyResult({ data: { contractors: [] } }))
    renderComponent(vi.fn(), {
      emptyStateTitle: 'No active contractors',
      emptyStateDescription:
        'Activate at least one contractor before recording a historical payment.',
    })
    expect(screen.getByText('No active contractors')).toBeInTheDocument()
    expect(
      screen.getByText('Activate at least one contractor before recording a historical payment.'),
    ).toBeInTheDocument()
  })

  test('renders an error alert when the hook reports errors', () => {
    const error: SDKError = {
      category: 'internal_error',
      message: 'Something went wrong loading contractors',
      fieldErrors: [],
    }
    mockUseSelectContractors.mockReturnValue(
      readyResult({
        errorHandling: { errors: [error], retryQueries: vi.fn(), clearSubmitError: vi.fn() },
      }),
    )
    renderComponent()
    expect(screen.getByText('Something went wrong loading contractors')).toBeInTheDocument()
  })
})
