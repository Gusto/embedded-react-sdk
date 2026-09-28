import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type * as ReactQuery from '@tanstack/react-query'
import { AddEmployeesToPolicy } from './AddEmployeesToPolicy'
import type * as UseBase from '@/components/Base/useBase'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockEmployees = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobs: [{ primary: true, title: 'Engineer', hireDate: '2024-01-01' }],
    department: 'Engineering',
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

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesGet', () => ({
  useTimeOffPoliciesGetSuspense: () => ({
    data: {
      timeOffPolicy: {
        uuid: 'policy-456',
        accrualMethod: 'per_pay_period',
        employees: [],
      },
    },
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees', () => ({
  useTimeOffPoliciesAddEmployeesMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesUpdate', () => ({
  useTimeOffPoliciesUpdateMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@tanstack/react-query', async importActual => {
  const actual = await importActual<typeof ReactQuery>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  }
})

vi.mock('@/components/Base/useBase', async importOriginal => {
  const actual = await importOriginal<typeof UseBase>()
  return {
    ...actual,
    useBase: () => ({
      onEvent: vi.fn(),
      baseSubmitHandler: vi.fn(async (_: unknown, fn: () => Promise<void>) => fn()),
      setError: vi.fn(),
      error: null,
      LoadingIndicator: () => null,
    }),
  }
})

describe('AddEmployeesToPolicy', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    policyId: 'policy-456',
    policyType: 'vacation' as const,
    onEvent,
  }

  it('renders the employee selection screen', async () => {
    renderWithProviders(<AddEmployeesToPolicy {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Add employees to policy')).toBeInTheDocument()
    })
  })

  it('applies custom className to the root element', async () => {
    const { container } = renderWithProviders(
      <AddEmployeesToPolicy {...defaultProps} className="custom-class" />,
    )

    await waitFor(() => {
      expect(screen.getByText('Add employees to policy')).toBeInTheDocument()
    })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
