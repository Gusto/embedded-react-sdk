import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const mockEmployees = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobs: [{ primary: true, title: 'Engineer' }],
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
    jobs: [{ primary: true, title: 'Designer' }],
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
    jobs: [{ primary: true, title: 'Manager' }],
    department: 'Management',
    // New hire — no PTO history
    eligiblePaidTimeOff: [],
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

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalled()
      })
      const submitted = mockAddEmployees.mock.calls[0]?.[0].request.requestBody.employees as Array<{
        uuid: string
        balance?: string
      }>
      expect(submitted.find(e => e.uuid === '1')).toEqual({ uuid: '1', balance: '40' })
    })

    it('omits balance for selected employees with no carry-over and no user input', async () => {
      const user = userEvent.setup()
      renderComponent({ mode: 'standalone' })

      await waitFor(() => {
        expect(screen.getByText('Carol Davis')).toBeInTheDocument()
      })

      // Select Carol (third employee) — she has no PTO history, no user input
      await user.click(screen.getAllByRole('checkbox')[3] as Element)
      await user.click(screen.getByRole('button', { name: 'continueCta' }))

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalled()
      })
      const submitted = mockAddEmployees.mock.calls[0]?.[0].request.requestBody.employees as Array<{
        uuid: string
        balance?: string
      }>
      const carol = submitted.find(e => e.uuid === '3')
      expect(carol).toEqual({ uuid: '3' })
      expect(carol).not.toHaveProperty('balance')
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

      await waitFor(() => {
        expect(mockAddEmployees).toHaveBeenCalled()
      })
      const submitted = mockAddEmployees.mock.calls[0]?.[0].request.requestBody.employees as Array<{
        uuid: string
        balance?: string
      }>
      expect(submitted.find(e => e.uuid === '1')).toEqual({ uuid: '1', balance: '40' })
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
  })
})
