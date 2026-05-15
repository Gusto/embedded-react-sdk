import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type * as ReactQuery from '@tanstack/react-query'
import type { CreatableTimeOffPolicyType } from '../../TimeOffFlow/timeOffPolicyTypes'
import { SelectEmployeesTimeOff } from './SelectEmployeesTimeOff'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { mockUseContainerBreakpoints } from '@/test/setup'

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

const mockAddEmployees = vi.fn()
const mockOnEvent = vi.fn()
const mockInvalidateQueries = vi.fn()
let mockPolicyEmployees: Array<{ uuid: string; balance?: string }> = []
let mockPolicyAccrualMethod: string | undefined

const mockEmployees = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobs: [{ primary: true, title: 'Engineer', hireDate: '2024-01-01' }],
    department: 'Engineering',
    eligiblePaidTimeOff: [
      {
        name: 'Vacation Hours',
        policyName: 'Old Vacation Policy',
        policyUuid: 'old-policy-uuid',
        accrualBalance: '40',
      },
      {
        name: 'Sick Hours',
        policyName: 'Old Sick Policy',
        policyUuid: 'old-sick-policy',
        accrualBalance: '8',
      },
    ],
  },
  {
    uuid: '2',
    firstName: 'Bob',
    lastName: 'Jones',
    jobs: [{ primary: true, title: 'Designer', hireDate: '2024-01-01' }],
    department: 'Design',
    eligiblePaidTimeOff: [
      {
        name: 'Vacation Hours',
        policyName: 'Old Vacation Policy',
        policyUuid: 'old-policy-uuid',
        accrualBalance: '0',
      },
    ],
  },
  {
    uuid: '3',
    firstName: 'Carol',
    lastName: 'Davis',
    jobs: [{ primary: true, title: 'Manager', hireDate: '2024-01-01' }],
    department: 'Management',
    // New hire — no PTO history
    eligiblePaidTimeOff: [],
  },
]

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesListSuspense: (request: { searchTerm?: string }) => {
    const filtered = request.searchTerm
      ? mockEmployees.filter(e =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(request.searchTerm!.toLowerCase()),
        )
      : mockEmployees
    return {
      data: {
        showEmployees: filtered,
        httpMeta: { response: { headers: new Headers() } },
      },
      isFetching: false,
    }
  },
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees', () => ({
  useTimeOffPoliciesAddEmployeesMutation: () => ({
    mutateAsync: mockAddEmployees,
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesUpdate', () => ({
  useTimeOffPoliciesUpdateMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ timeOffPolicy: { uuid: 'policy-456' } }),
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesGet', () => ({
  useTimeOffPoliciesGetSuspense: () => ({
    data: {
      timeOffPolicy: {
        uuid: 'policy-456',
        accrualMethod: mockPolicyAccrualMethod,
        employees: mockPolicyEmployees,
      },
    },
  }),
}))

vi.mock('@tanstack/react-query', async importActual => {
  const actual = await importActual<typeof ReactQuery>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  }
})

const mockBaseSubmitHandler = vi.fn(async (_: unknown, fn: () => Promise<void>) => fn())

vi.mock('@/components/Base/useBase', () => ({
  useBase: () => ({
    onEvent: mockOnEvent,
    baseSubmitHandler: mockBaseSubmitHandler,
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

function renderComponent(
  props: Partial<{
    mode: 'standalone' | 'wizard'
    policyType: CreatableTimeOffPolicyType
  }> = {},
) {
  return renderWithProviders(
    <SelectEmployeesTimeOff
      companyId="company-123"
      policyId="policy-456"
      policyType="vacation"
      {...props}
    />,
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
    mockAddEmployees.mockResolvedValue({ timeOffPolicy: { uuid: 'policy-456' } })
    mockPolicyEmployees = []
    mockPolicyAccrualMethod = undefined
  })

  it('renders employee names from API data', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('hides employees whose primary job hire_date is in the future', async () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    mockEmployees.push({
      uuid: '99',
      firstName: 'Future',
      lastName: 'Hire',
      jobs: [{ primary: true, title: 'Engineer', hireDate: future }],
      department: 'Engineering',
      eligiblePaidTimeOff: [],
    })
    try {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })
      expect(screen.queryByText('Future Hire')).not.toBeInTheDocument()
    } finally {
      mockEmployees.pop()
    }
  })

  it('renders department column values', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })
    expect(screen.getByText('Design')).toBeInTheDocument()
  })

  it('shows reassignment warning alert when selecting employee with existing PTO', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[FIRST_EMPLOYEE_CHECKBOX]!)

    await waitFor(() => {
      expect(screen.getByText('reassignmentWarning')).toBeInTheDocument()
    })
  })

  it('does not show reassignment warning for employee without existing PTO', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Carol Davis')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[checkboxes.length - 1]!)

    expect(screen.queryByText('reassignmentWarning')).not.toBeInTheDocument()
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

  it('fires TIME_OFF_ADD_EMPLOYEES_BACK when Back is clicked', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'backCta' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'backCta' }))
    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_ADD_EMPLOYEES_BACK)
  })

  describe('carry-over balance pre-fill', () => {
    it("pre-fills balance input from eligiblePaidTimeOff matching the new policy's type", async () => {
      renderComponent({ policyType: 'vacation' })
      await waitFor(() => {
        expect(screen.getByDisplayValue('40')).toBeInTheDocument()
      })
      // Bob's vacation carry-over is '0'
      expect(screen.getByDisplayValue('0')).toBeInTheDocument()
    })

    it("ignores eligiblePaidTimeOff entries that don't match the new policy's type", async () => {
      // Alice has Sick Hours = '8' but for a vacation policy we should NOT pre-fill from sick
      renderComponent({ policyType: 'vacation' })
      await waitFor(() => {
        expect(screen.getByDisplayValue('40')).toBeInTheDocument()
      })
      expect(screen.queryByDisplayValue('8')).not.toBeInTheDocument()
    })

    it('pulls Sick Hours carry-over when adding to a sick policy', async () => {
      renderComponent({ policyType: 'sick' })
      await waitFor(() => {
        expect(screen.getByDisplayValue('8')).toBeInTheDocument()
      })
      // Alice's vacation '40' should NOT pre-fill on a sick policy
      expect(screen.queryByDisplayValue('40')).not.toBeInTheDocument()
    })

    it('shows empty input for employees with no matching PTO history', async () => {
      renderComponent({ policyType: 'vacation' })
      await waitFor(() => {
        expect(screen.getByText('Carol Davis')).toBeInTheDocument()
      })
      // Carol (uuid '3') has no PTO history; her input should be empty
      const carolInputs = screen
        .getAllByRole('textbox')
        .filter(input => (input as HTMLInputElement).name === 'balance-3')
      expect((carolInputs[0] as HTMLInputElement).value).toBe('')
    })
  })

  describe('standalone mode submit', () => {
    it('submits with carry-over balance for selected employees who did not edit', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: {
              employees: [{ uuid: '1', balance: '40' }],
            },
          },
        })
      })
    })

    it('submits user-typed balance overriding carry-over', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getByDisplayValue('40')).toBeInTheDocument()
      })

      // fireEvent.change is used in place of userEvent.clear/type because
      // userEvent cannot focus the underlying react-aria Input under JSDOM.
      const aliceInput = screen.getByDisplayValue('40') as HTMLInputElement
      fireEvent.change(aliceInput, { target: { value: '80' } })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: {
              employees: [{ uuid: '1', balance: '80' }],
            },
          },
        })
      })
    })

    it('falls back to carry-over when user clears the input (does not zero out)', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getByDisplayValue('40')).toBeInTheDocument()
      })

      const aliceInput = screen.getByDisplayValue('40') as HTMLInputElement
      fireEvent.change(aliceInput, { target: { value: '' } })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalled()
      })
      const submitted = mockAddEmployees.mock.calls[0]?.[0].request.requestBody.employees as Array<{
        uuid: string
        balance?: string
      }>
      expect(submitted.find(e => e.uuid === '1')).toEqual({ uuid: '1', balance: '40' })
    })

    it('defaults balance to 0 for selected employees with no carry-over and no user input', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getByText('Carol Davis')).toBeInTheDocument()
      })

      // Select Carol (third employee) — she has no PTO history, no user input
      await user.click(screen.getAllByRole('checkbox')[3] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalled()
      })
      const submitted = mockAddEmployees.mock.calls[0]?.[0].request.requestBody.employees as Array<{
        uuid: string
        balance?: string
      }>
      const carol = submitted.find(e => e.uuid === '3')
      expect(carol).toEqual({ uuid: '3', balance: '0' })
    })

    it('submits multiple selected UUIDs with their respective carry-over balances', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBe(4)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(checkboxes[SECOND_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: {
              employees: expect.arrayContaining([
                { uuid: '1', balance: '40' },
                { uuid: '2', balance: '0' },
              ]),
            },
          },
        })
      })
    })

    it('preserves carry-over for selected employees that get filtered out before submit', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      // Select Alice (carry-over balance 40 for vacation)
      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)

      // Search for someone else — Alice's row leaves the DOM
      await user.type(screen.getByPlaceholderText('searchPlaceholder'), 'bob')
      await waitFor(() => {
        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
      })

      // Submit — Alice's carry-over should still be in the request even though
      // her row is no longer rendered (carry-over is captured at select-time).
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalled()
      })
      const submitted = mockAddEmployees.mock.calls[0]?.[0].request.requestBody.employees as Array<{
        uuid: string
        balance?: string
      }>
      expect(submitted.find(e => e.uuid === '1')).toEqual({ uuid: '1', balance: '40' })
    })
    it('opens add confirm dialog and gates submission until confirmed', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      expect(
        await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }),
      ).toBeInTheDocument()
      expect(mockAddEmployees).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledTimes(1)
      })
    })

    it('cancelling the add confirm dialog does not submit', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      const cancelBtn = await screen.findByRole('button', { name: 'addConfirmDialog.cancelCta' })
      await user.click(cancelBtn)

      expect(mockAddEmployees).not.toHaveBeenCalled()
    })

    it('emits DONE without any mutation when nothing is selected', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
      })
      expect(mockAddEmployees).not.toHaveBeenCalled()
    })
  })

  describe('standalone mode with existing assignees', () => {
    it('filters existing policy assignees out of the selectable list', async () => {
      mockPolicyEmployees = [{ uuid: '1', balance: '12' }]
      renderComponent({ mode: 'standalone' })
      await waitFor(() => {
        expect(screen.getByText('Bob Jones')).toBeInTheDocument()
      })
      // Alice (uuid '1') is already on the policy and must not appear in the add list
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
      // Bob + Carol + select-all header = 3 (Alice already on policy)
      expect(screen.getAllByRole('checkbox').length).toBe(3)
    })

    it('submits only newly-added employees', async () => {
      const user = userEvent.setup()
      mockPolicyEmployees = [{ uuid: '1', balance: '12' }]
      renderComponent({ mode: 'standalone' })
      await waitFor(() => {
        expect(screen.getByText('Bob Jones')).toBeInTheDocument()
      })
      // Add Bob — he is not yet on the policy
      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))
      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: { employees: [{ uuid: '2', balance: '0' }] },
          },
        })
      })
    })
  })

  describe('unlimited policy', () => {
    it('hides the starting balance column when accrualMethod is unlimited', async () => {
      mockPolicyAccrualMethod = 'unlimited'
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      })

      expect(screen.queryByText('startingBalanceColumn')).not.toBeInTheDocument()
      const balanceInputs = screen
        .queryAllByRole('textbox')
        .filter(el => (el as HTMLInputElement).name.startsWith('balance-'))
      expect(balanceInputs).toHaveLength(0)
    })

    it('submits balance "0" for unlimited policies instead of carry-over values', async () => {
      const user = userEvent.setup()
      mockPolicyAccrualMethod = 'unlimited'
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))
      await user.click(await screen.findByRole('button', { name: 'addConfirmDialog.confirmCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-456',
            requestBody: {
              employees: [{ uuid: '1', balance: '0' }],
            },
          },
        })
      })
    })
  })

  describe('wizard mode', () => {
    it('calls add-employees mutation with balances in wizard mode', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'wizard' })

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
      })

      await user.click(screen.getAllByRole('checkbox')[FIRST_EMPLOYEE_CHECKBOX] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalledTimes(1)
      })
    })
  })
})
