import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import type { SelectEmployeesPresentationProps } from './SelectEmployeesPresentationTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { mockUseContainerBreakpoints } from '@/test/setup'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

const mockEmployees = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobTitle: 'Engineer',
    department: 'Engineering',
  },
  { uuid: '2', firstName: 'Bob', lastName: 'Jones', jobTitle: 'Designer', department: 'Design' },
]

const defaultProps: SelectEmployeesPresentationProps = {
  employees: mockEmployees,
  selectedUuids: new Set<string>(),
  searchValue: '',
  onSelect: vi.fn(),
  onSearchChange: vi.fn(),
  onSearchClear: vi.fn(),
  onBack: vi.fn(),
  onContinue: vi.fn(),
  showReassignmentWarning: false,
}

function renderPresentation(overrides: Partial<SelectEmployeesPresentationProps> = {}) {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <SelectEmployeesPresentation {...defaultProps} {...overrides} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('SelectEmployeesPresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
  })

  test('renders heading', () => {
    renderPresentation()
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  test('renders holidayDescription when showReassignmentWarning is false', () => {
    renderPresentation({ showReassignmentWarning: false })
    expect(screen.getByText('holidayDescription')).toBeInTheDocument()
    expect(screen.queryByText('description')).not.toBeInTheDocument()
  })

  test('renders description when showReassignmentWarning is true', () => {
    renderPresentation({ showReassignmentWarning: true })
    expect(screen.getByText('description')).toBeInTheDocument()
    expect(screen.queryByText('holidayDescription')).not.toBeInTheDocument()
  })

  test('does not render reassignment warning Alert when showReassignmentWarning is false', () => {
    renderPresentation({ showReassignmentWarning: false })
    expect(screen.queryByText('reassignmentWarning')).not.toBeInTheDocument()
  })

  test('renders reassignment warning Alert when showReassignmentWarning is true', () => {
    renderPresentation({ showReassignmentWarning: true })
    expect(screen.getByText('reassignmentWarning')).toBeInTheDocument()
  })

  test('renders Department column header and values', () => {
    renderPresentation()
    expect(screen.getByText('departmentColumn')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  test('renders employee names', () => {
    renderPresentation()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  test('renders Back and Continue buttons', () => {
    renderPresentation()
    expect(screen.getByRole('button', { name: 'backCta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'continueCta' })).toBeInTheDocument()
  })

  test('calls onBack when Back button is clicked', async () => {
    const onBack = vi.fn()
    renderPresentation({ onBack })
    await userEvent.click(screen.getByRole('button', { name: 'backCta' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  test('calls onContinue when Continue button is clicked', async () => {
    const onContinue = vi.fn()
    renderPresentation({ onContinue })
    await userEvent.click(screen.getByRole('button', { name: 'continueCta' }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  test('calls onSelect with item and checked=true when a checkbox is clicked', async () => {
    const onSelect = vi.fn()
    renderPresentation({ onSelect })
    // checkboxes[0] is the select-all header; checkboxes[1] is first employee
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[1] as Element)
    expect(onSelect).toHaveBeenCalledWith(mockEmployees[0], true)
  })

  test('renders selected state for checked employees', () => {
    renderPresentation({ selectedUuids: new Set(['1']) })
    // checkboxes[0] = select-all header, checkboxes[1] = Alice (uuid '1'), checkboxes[2] = Bob (uuid '2')
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[1]).toBeChecked()
    expect(checkboxes[2]).not.toBeChecked()
  })

  test('calls onSearchChange when user types in search input', async () => {
    const onSearchChange = vi.fn()
    renderPresentation({ onSearchChange })
    const input = screen.getByPlaceholderText('searchPlaceholder')
    await userEvent.type(input, 'A')
    expect(onSearchChange).toHaveBeenCalledWith('A')
  })

  test('calls onSearchClear when clear button is clicked', async () => {
    const onSearchClear = vi.fn()
    renderPresentation({ searchValue: 'alice', onSearchClear })
    await userEvent.click(screen.getByLabelText('clearSearch'))
    expect(onSearchClear).toHaveBeenCalledOnce()
  })

  test('shows empty search results state when no employees match', () => {
    renderPresentation({ employees: [], searchValue: 'nonexistent' })
    expect(screen.getByText('noSearchResults')).toBeInTheDocument()
  })

  test('renders pagination when pagination prop is provided', () => {
    renderPresentation({
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        itemsPerPage: 10,
        handleFirstPage: vi.fn(),
        handlePreviousPage: vi.fn(),
        handleNextPage: vi.fn(),
        handleLastPage: vi.fn(),
        handleItemsPerPageChange: vi.fn(),
      },
    })
    expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
  })
})
