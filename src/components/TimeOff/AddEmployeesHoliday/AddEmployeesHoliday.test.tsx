import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { AddEmployeesHoliday } from './AddEmployeesHoliday'
import type * as UseBase from '@/components/Base/useBase'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockEmployees = [
  {
    uuid: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    jobs: [{ primary: true, title: 'Engineer', hireDate: '2024-01-01' }],
    department: 'Engineering',
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

vi.mock('@gusto/embedded-api/react-query/holidayPayPoliciesGet', () => ({
  useHolidayPayPoliciesGetSuspense: () => ({
    data: {
      holidayPayPolicy: { version: 'abc123', employees: [] },
    },
  }),
  invalidateAllHolidayPayPoliciesGet: vi.fn(),
  queryKeyHolidayPayPoliciesGet: (companyUuid: string) => [
    '@gusto/embedded-api-v-2026-06-15',
    'holidayPayPolicies',
    'get',
    companyUuid,
  ],
}))

vi.mock('@gusto/embedded-api/react-query/holidayPayPoliciesAddEmployees', () => ({
  useHolidayPayPoliciesAddEmployeesMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

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

describe('AddEmployeesHoliday', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  it('renders the employee selection screen', async () => {
    renderWithProviders(<AddEmployeesHoliday {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Add employees to policy')).toBeInTheDocument()
    })
  })

  it('applies custom className to the root element', async () => {
    const { container } = renderWithProviders(
      <AddEmployeesHoliday {...defaultProps} className="custom-class" />,
    )

    await waitFor(() => {
      expect(screen.getByText('Add employees to policy')).toBeInTheDocument()
    })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
