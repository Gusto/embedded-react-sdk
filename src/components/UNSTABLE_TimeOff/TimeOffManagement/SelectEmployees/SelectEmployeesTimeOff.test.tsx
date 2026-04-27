import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectEmployeesTimeOff } from './SelectEmployeesTimeOff'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { mockUseContainerBreakpoints } from '@/test/setup'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

const mockAddEmployees = vi.fn()
const mockOnEvent = vi.fn()

const mockEmployees = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobs: [{ primary: true, title: 'Engineer' }],
    department: 'Engineering',
  },
  {
    uuid: '2',
    firstName: 'Bob',
    lastName: 'Jones',
    jobs: [{ primary: true, title: 'Designer' }],
    department: 'Design',
  },
]

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: {
      showEmployees: mockEmployees,
      httpMeta: { response: { headers: new Headers() } },
    },
    isFetching: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees', () => ({
  useTimeOffPoliciesAddEmployeesMutation: () => ({
    mutateAsync: mockAddEmployees,
    isPending: false,
  }),
}))

vi.mock('@/components/Base/useBase', () => ({
  useBase: () => ({
    onEvent: mockOnEvent,
    baseSubmitHandler: vi.fn(async (_, fn: () => Promise<void>) => fn()),
    setError: vi.fn(),
    error: null,
    LoadingIndicator: () => null,
  }),
}))

vi.mock('@/hooks/usePagination/usePagination', () => ({
  usePagination: () => ({
    currentPage: 1,
    itemsPerPage: 25,
    getPaginationProps: vi.fn().mockReturnValue(undefined),
    resetPage: vi.fn(),
  }),
}))

function renderComponent(props: Partial<{ mode: 'standalone' | 'wizard' }> = {}) {
  return renderWithProviders(
    <SelectEmployeesTimeOff companyId="company-123" policyId="policy-456" {...props} />,
  )
}

// DataTable renders a select-all header checkbox (index 0) when selectionMode="multiple"
// and getIsItemSelected is provided. Employee checkboxes start at index 1.
const FIRST_EMPLOYEE_CHECKBOX = 1
const SECOND_EMPLOYEE_CHECKBOX = 2

describe('SelectEmployeesTimeOff', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
    mockAddEmployees.mockResolvedValue({})
  })

  it('renders employee names from API data', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('renders department column values', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('shows reassignment warning alert', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('reassignmentWarning')).toBeInTheDocument()
    })
  })

  it('filters employees by search value', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('searchPlaceholder')
    await user.type(input, 'alice')

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
  })

  it('fires CANCEL when Back is clicked', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'backCta' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'backCta' }))
    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
  })

  describe('standalone mode', () => {
    it('calls mutation with selected employee UUID and fires TIME_OFF_ADD_EMPLOYEES_DONE', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      // Wait for employee checkboxes (header select-all at [0] + 2 employee rows = 3 total)
      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: {
              employees: [{ uuid: '1' }],
            },
          },
        })
      })

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
      })
    })

    it('calls mutation with multiple selected UUIDs', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      // 1 select-all header + 2 employees = 3 checkboxes
      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBe(3)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(checkboxes[SECOND_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: {
              employees: expect.arrayContaining([{ uuid: '1' }, { uuid: '2' }]),
            },
          },
        })
      })
    })
  })

  describe('wizard mode', () => {
    it('fires TIME_OFF_ADD_EMPLOYEES_DONE with employeeUuids and does NOT call mutation', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'wizard' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, {
          employeeUuids: ['1'],
        })
      })

      expect(mockAddEmployees).not.toHaveBeenCalled()
    })

    it('includes all selected UUIDs in wizard event payload', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'wizard' })

      // 1 select-all header + 2 employees = 3 checkboxes
      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBe(3)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(checkboxes[SECOND_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, {
          employeeUuids: expect.arrayContaining(['1', '2']),
        })
      })
    })
  })
})
