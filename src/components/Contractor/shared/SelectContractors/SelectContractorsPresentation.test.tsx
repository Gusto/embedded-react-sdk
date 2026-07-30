import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { SelectContractorsPresentation } from './SelectContractorsPresentation'
import type { SelectContractorsPresentationProps } from './SelectContractorsPresentationTypes'
import { buildContractorIndividual, buildContractorBusiness } from '@/test/factories/contractor'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

const mockContractors = [
  buildContractorIndividual({
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    wageType: 'Hourly',
    hourlyRate: '45.00',
  }),
  buildContractorBusiness({ uuid: '2', businessName: 'Acme LLC', wageType: 'Fixed' }),
]

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

const defaultProps: SelectContractorsPresentationProps = {
  contractors: mockContractors,
  selectedIds: new Set<string>(),
  searchValue: '',
  onSelect: vi.fn(),
  onSelectAll: vi.fn(),
  onSearchChange: vi.fn(),
  onSearchClear: vi.fn(),
  pagination,
  isFetching: false,
}

function renderPresentation(overrides: Partial<SelectContractorsPresentationProps> = {}) {
  return render(
    <LocaleProvider>
      <ThemeProvider>
        <ComponentsProvider value={defaultComponents}>
          <SelectContractorsPresentation {...defaultProps} {...overrides} />
        </ComponentsProvider>
      </ThemeProvider>
    </LocaleProvider>,
  )
}

describe('SelectContractorsPresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders contractor names', () => {
    renderPresentation()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Acme LLC')).toBeInTheDocument()
  })

  test('renders contractor type beneath the name', () => {
    renderPresentation()
    expect(screen.getByText('Individual')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  test('renders wage for hourly and fixed contractors', () => {
    renderPresentation()
    expect(screen.getByText('wageHourly')).toBeInTheDocument()
    expect(screen.getByText('Fixed')).toBeInTheDocument()
  })

  test('calls onSelect with the contractor and checked=true when a row checkbox is clicked', async () => {
    const onSelect = vi.fn()
    renderPresentation({ onSelect })
    // checkboxes[0] is the select-all header; checkboxes[1] is the first contractor row.
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[1] as Element)
    expect(onSelect).toHaveBeenCalledWith(mockContractors[0], true)
  })

  test('calls onSelectAll when the header checkbox is clicked', async () => {
    const onSelectAll = vi.fn()
    renderPresentation({ onSelectAll })
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0] as Element)
    expect(onSelectAll).toHaveBeenCalledWith(true, mockContractors)
  })

  test('renders selected state for checked contractors', () => {
    renderPresentation({ selectedIds: new Set(['1']) })
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[1]).toBeChecked()
    expect(checkboxes[2]).not.toBeChecked()
  })

  test('calls onSearchChange when the user types in the search input', async () => {
    const onSearchChange = vi.fn()
    renderPresentation({ onSearchChange })
    const input = screen.getByPlaceholderText('searchPlaceholder')
    await userEvent.type(input, 'A')
    expect(onSearchChange).toHaveBeenCalledWith('A')
  })

  test('calls onSearchChange and onSearchClear when the search input is cleared', async () => {
    const onSearchChange = vi.fn()
    const onSearchClear = vi.fn()
    renderPresentation({ searchValue: 'alice', onSearchChange, onSearchClear })
    await userEvent.clear(screen.getByRole('searchbox'))
    expect(onSearchChange).toHaveBeenCalledWith('')
    expect(onSearchClear).toHaveBeenCalledOnce()
  })

  test('shows the empty state when there are no contractors', () => {
    renderPresentation({ contractors: [] })
    expect(screen.getByText('emptyState')).toBeInTheDocument()
  })

  test('shows a custom empty state title and description when provided', () => {
    renderPresentation({
      contractors: [],
      emptyStateTitle: 'No active contractors',
      emptyStateDescription:
        'Activate at least one contractor before recording a historical payment.',
    })
    expect(screen.getByText('No active contractors')).toBeInTheDocument()
    expect(
      screen.getByText('Activate at least one contractor before recording a historical payment.'),
    ).toBeInTheDocument()
  })

  test('renders pagination controls', () => {
    renderPresentation({
      pagination: {
        ...pagination,
        totalPages: 3,
        totalCount: 30,
      },
    })
    expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
  })
})
