import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { EmployeeTable } from './EmployeeTable'
import type { EmployeeTableItem, EmployeeTableProps } from './EmployeeTableTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { mockUseContainerBreakpoints } from '@/test/setup'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

interface TestEmployee extends EmployeeTableItem {
  uuid: string
  department: string
  balance?: number
}

const testEmployees: TestEmployee[] = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobTitle: 'Engineer',
    department: 'Engineering',
    balance: 40,
  },
  {
    uuid: '2',
    firstName: 'Bob',
    lastName: 'Jones',
    jobTitle: 'Designer',
    department: 'Design',
    balance: 24,
  },
  {
    uuid: '3',
    firstName: 'Carol',
    lastName: 'Williams',
    jobTitle: 'Manager',
    department: 'Sales',
    balance: 60,
  },
]

const defaultProps: EmployeeTableProps<TestEmployee> = {
  data: testEmployees,
  searchValue: '',
  onSearchChange: vi.fn(),
  onSearchClear: vi.fn(),
}

beforeEach(() => {
  mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
})

function renderEmployeeTable(overrides: Partial<EmployeeTableProps<TestEmployee>> = {}) {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <EmployeeTable<TestEmployee> {...defaultProps} {...overrides} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('EmployeeTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
  })

  test('renders Name and Job title columns', () => {
    renderEmployeeTable()

    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('jobTitle')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Designer')).toBeInTheDocument()
  })

  test('renders additional columns when provided', () => {
    renderEmployeeTable({
      additionalColumns: [{ key: 'department' as keyof TestEmployee, title: 'Department' }],
    })

    expect(screen.getByText('Department')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  test('renders search input with placeholder', () => {
    renderEmployeeTable()

    expect(screen.getByPlaceholderText('searchPlaceholder')).toBeInTheDocument()
  })

  test('renders search input with custom placeholder', () => {
    renderEmployeeTable({ searchPlaceholder: 'Find team members' })

    expect(screen.getByPlaceholderText('Find team members')).toBeInTheDocument()
  })

  test('fires onSearchChange when user types in search', async () => {
    const onSearchChange = vi.fn()
    renderEmployeeTable({ onSearchChange })

    const input = screen.getByPlaceholderText('searchPlaceholder')
    await userEvent.type(input, 'A')

    expect(onSearchChange).toHaveBeenCalledWith('A')
  })

  test('does not show clear button when search is empty', () => {
    renderEmployeeTable({ searchValue: '' })

    expect(screen.queryByLabelText('clearSearch')).not.toBeInTheDocument()
  })

  test('shows clear button when search has value and fires onSearchClear', async () => {
    const onSearchClear = vi.fn()
    renderEmployeeTable({ searchValue: 'alice', onSearchClear })

    const clearButton = screen.getByLabelText('clearSearch')
    expect(clearButton).toBeInTheDocument()

    await userEvent.click(clearButton)
    expect(onSearchClear).toHaveBeenCalledOnce()
  })

  test('renders default empty search state when search has no results', () => {
    renderEmployeeTable({
      data: [],
      searchValue: 'nonexistent',
    })

    expect(screen.getByText('noSearchResults')).toBeInTheDocument()
  })

  test('renders custom empty search state when provided', () => {
    renderEmployeeTable({
      data: [],
      searchValue: 'nonexistent',
      emptySearchState: () => <div>Custom no results message</div>,
    })

    expect(screen.getByText('Custom no results message')).toBeInTheDocument()
  })

  test('renders default empty state when data is empty with no search', () => {
    renderEmployeeTable({
      data: [],
      searchValue: '',
      emptyState: () => <div>No employees yet</div>,
    })

    expect(screen.getByText('No employees yet')).toBeInTheDocument()
  })

  test('renders selection checkboxes when selectionMode and onSelect are provided', () => {
    const onSelect = vi.fn()
    renderEmployeeTable({
      selectionMode: 'multiple',
      onSelect,
    })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(testEmployees.length)
  })

  test('calls onSelect when a checkbox is clicked', async () => {
    const onSelect = vi.fn()
    renderEmployeeTable({
      selectionMode: 'multiple',
      onSelect,
    })

    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0] as Element)

    expect(onSelect).toHaveBeenCalledWith(testEmployees[0], true)
  })

  test('renders item menu for each row when itemMenu is provided', () => {
    renderEmployeeTable({
      itemMenu: employee => <button>Remove {employee.firstName}</button>,
    })

    expect(screen.getByText('Remove Alice')).toBeInTheDocument()
    expect(screen.getByText('Remove Bob')).toBeInTheDocument()
    expect(screen.getByText('Remove Carol')).toBeInTheDocument()
  })

  test('renders pagination when pagination prop is provided', () => {
    renderEmployeeTable({
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

  test('does not render pagination when pagination prop is omitted', () => {
    renderEmployeeTable()

    expect(screen.queryByTestId('pagination-control')).not.toBeInTheDocument()
  })

  test('handles employees with missing name fields gracefully', () => {
    renderEmployeeTable({
      data: [
        {
          uuid: '1',
          firstName: null,
          lastName: null,
          jobTitle: null,
          department: 'Unknown',
          balance: 0,
        },
      ],
    })

    expect(screen.getByText('name')).toBeInTheDocument()
  })

  test('renders additional columns with custom render functions', () => {
    renderEmployeeTable({
      additionalColumns: [
        {
          key: 'balance' as keyof TestEmployee,
          title: 'Balance (hrs)',
          render: employee => `${employee.balance ?? 0} hrs`,
        },
      ],
    })

    expect(screen.getByText('Balance (hrs)')).toBeInTheDocument()
    expect(screen.getByText('40 hrs')).toBeInTheDocument()
    expect(screen.getByText('24 hrs')).toBeInTheDocument()
    expect(screen.getByText('60 hrs')).toBeInTheDocument()
  })
})
