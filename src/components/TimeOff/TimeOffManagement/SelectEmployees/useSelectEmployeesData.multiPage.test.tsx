import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type * as ReactQuery from '@tanstack/react-query'
import type * as GustoContext from '@gusto/embedded-api-v-2025-11-15/react-query/_context'
import { SelectEmployeesTimeOff } from './SelectEmployeesTimeOff'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { mockUseContainerBreakpoints } from '@/test/setup'

// This file exercises the multi-page fetch path in useSelectEmployeesData:
// - reads x-total-pages from the first page's response headers
// - issues additional queries via useSuspenseQueries for pages 2..N
// - merges all pages into a single client-side list

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

const page1Employees = [
  {
    uuid: '1',
    firstName: 'Page1',
    lastName: 'Alice',
    jobs: [{ primary: true, title: 'Engineer', hireDate: '2024-01-01' }],
    department: 'Engineering',
    eligiblePaidTimeOff: [],
  },
]

const page2Employees = [
  {
    uuid: '2',
    firstName: 'Page2',
    lastName: 'Bob',
    jobs: [{ primary: true, title: 'Designer', hireDate: '2024-01-01' }],
    department: 'Design',
    eligiblePaidTimeOff: [],
  },
]

let mockTotalPages = 1
const buildEmployeesListQueryMock = vi.fn()

vi.mock('@gusto/embedded-api-v-2025-11-15/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: {
      showEmployees: page1Employees,
      httpMeta: {
        response: {
          headers: new Headers({ 'x-total-pages': String(mockTotalPages) }),
        },
      },
    },
    isFetching: false,
  }),
  buildEmployeesListQuery: (...args: unknown[]) => {
    buildEmployeesListQueryMock(...args)
    // useSuspenseQueries calls queryFn for each query; our mocked
    // useSuspenseQueries below doesn't actually invoke it, but we return
    // a valid shape just in case.
    return {
      queryKey: ['mock-employees-list', args],
      queryFn: () => Promise.resolve({ showEmployees: page2Employees }),
    }
  },
}))

vi.mock('@gusto/embedded-api-v-2025-11-15/react-query/_context', async importOriginal => {
  const actual = await importOriginal<typeof GustoContext>()
  return {
    ...actual,
    useGustoEmbeddedContext: () => ({}),
  }
})

vi.mock('@tanstack/react-query', async importActual => {
  const actual = await importActual<typeof ReactQuery>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    useSuspenseQueries: ({ queries }: { queries: Array<{ queryKey: unknown }> }) =>
      queries.map(() => ({
        data: { showEmployees: page2Employees },
        isFetching: false,
      })),
  }
})

vi.mock('@gusto/embedded-api-v-2025-11-15/react-query/timeOffPoliciesAddEmployees', () => ({
  useTimeOffPoliciesAddEmployeesMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api-v-2025-11-15/react-query/timeOffPoliciesUpdate', () => ({
  useTimeOffPoliciesUpdateMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api-v-2025-11-15/react-query/timeOffPoliciesGet', () => ({
  useTimeOffPoliciesGetSuspense: () => ({
    data: { timeOffPolicy: { uuid: 'policy-456', employees: [] } },
  }),
}))

vi.mock('@/components/Base/useBase', () => ({
  useBase: () => ({
    onEvent: vi.fn(),
    baseSubmitHandler: vi.fn(async (_: unknown, fn: () => Promise<void>) => fn()),
    setError: vi.fn(),
    error: null,
    LoadingIndicator: () => null,
  }),
}))

describe('useSelectEmployeesData multi-page fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
    mockTotalPages = 1
  })

  test('does not call buildEmployeesListQuery when x-total-pages is 1', async () => {
    mockTotalPages = 1
    renderWithProviders(
      <SelectEmployeesTimeOff
        companyId="company-123"
        policyId="policy-456"
        policyType="vacation"
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Page1 Alice')).toBeInTheDocument()
    })
    expect(buildEmployeesListQueryMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Page2 Bob')).not.toBeInTheDocument()
  })

  test('issues queries for pages 2..N when x-total-pages > 1', async () => {
    mockTotalPages = 3
    renderWithProviders(
      <SelectEmployeesTimeOff
        companyId="company-123"
        policyId="policy-456"
        policyType="vacation"
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Page1 Alice')).toBeInTheDocument()
    })
    // Pages 2 and 3 each get a buildEmployeesListQuery call. React 18 strict
    // mode can double-invoke renders, so assert on the unique page numbers
    // requested rather than the raw call count.
    const requestedPages = new Set(
      buildEmployeesListQueryMock.mock.calls.map(
        (call: unknown[]) => (call[1] as { page: number }).page,
      ),
    )
    expect(requestedPages).toEqual(new Set([2, 3]))
  })

  test('merges employees from all server pages into the displayed list', async () => {
    mockTotalPages = 2
    renderWithProviders(
      <SelectEmployeesTimeOff
        companyId="company-123"
        policyId="policy-456"
        policyType="vacation"
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Page1 Alice')).toBeInTheDocument()
    })
    // Page 2 employee should appear because useSuspenseQueries returns its data
    expect(screen.getByText('Page2 Bob')).toBeInTheDocument()
  })
})
