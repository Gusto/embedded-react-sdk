import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

// Exercises the client-side pagination/search state machine end-to-end
// through useClientPagination → useSelectEmployeesData.

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

function makeEmployee(index: number) {
  return {
    uuid: `uuid-${index}`,
    firstName: `Employee${index}`,
    lastName: 'Test',
    jobs: [{ primary: true, title: 'Engineer', hireDate: '2024-01-01' }],
    department: 'Engineering',
    eligiblePaidTimeOff: [],
  }
}

// 12 employees fits cleanly into "5 per page" → 3 pages (5/5/2).
const employees = Array.from({ length: 12 }, (_, i) => makeEmployee(i))

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: { showEmployees: employees },
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

function wrapper({ children }: { children: ReactNode }) {
  return (
    <GustoTestProvider>
      <Suspense fallback={null}>{children}</Suspense>
    </GustoTestProvider>
  )
}

describe('useSelectEmployeesData pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('initial state: page 1, default 5 items per page, total 12', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.itemsPerPage).toBe(5)
    expect(result.current.pagination.totalCount).toBe(12)
    expect(result.current.pagination.totalPages).toBe(3)
    expect(result.current.data.employees).toHaveLength(5)
    expect(result.current.data.employees[0]?.uuid).toBe('uuid-0')
    expect(result.current.status.isFetching).toBe(false)
    expect(result.current.status.isPending).toBe(false)
    expect(result.current.errorHandling.errors).toEqual([])
  })

  test('handleNextPage advances by one and clamps at totalPages', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.data.employees[0]?.uuid).toBe('uuid-5')

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.data.employees).toHaveLength(2)
  })

  test('handlePreviousPage decrements by one and clamps at 1', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    act(() => {
      result.current.pagination.handlePreviousPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.pagination.handlePreviousPage()
    })
    expect(result.current.pagination.currentPage).toBe(1)

    act(() => {
      result.current.pagination.handlePreviousPage()
    })
    expect(result.current.pagination.currentPage).toBe(1)
  })

  test('handleFirstPage jumps to page 1', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    act(() => {
      result.current.pagination.handleFirstPage()
    })
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data.employees[0]?.uuid).toBe('uuid-0')
  })

  test('handleLastPage jumps to totalPages', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.data.employees).toHaveLength(2)
  })

  test('handleItemsPerPageChange resets to page 1 and recomputes totalPages', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    act(() => {
      result.current.pagination.handleItemsPerPageChange(10)
    })
    expect(result.current.pagination.itemsPerPage).toBe(10)
    expect(result.current.pagination.totalPages).toBe(2)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data.employees).toHaveLength(10)
  })

  test('handleItemsPerPageChange is a no-op when value matches current', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.pagination.handleItemsPerPageChange(5)
    })
    expect(result.current.pagination.currentPage).toBe(2)
  })

  test('safeCurrentPage clamps when search filter shrinks results below current page', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    act(() => {
      result.current.actions.onSearchChange('Employee0 Test')
    })
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data.employees).toHaveLength(1)
    expect(result.current.data.employees[0]?.uuid).toBe('uuid-0')
  })

  test('onSearchChange resets currentPage to 1', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.actions.onSearchChange('Employee')
    })
    expect(result.current.pagination.currentPage).toBe(1)
  })

  test('onSearchClear resets currentPage to 1', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.actions.onSearchChange('Employee')
    })
    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.actions.onSearchClear()
    })
    expect(result.current.pagination.currentPage).toBe(1)
  })
})
