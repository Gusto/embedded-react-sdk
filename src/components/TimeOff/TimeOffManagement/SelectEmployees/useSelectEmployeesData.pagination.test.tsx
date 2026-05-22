import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type * as ReactQuery from '@tanstack/react-query'
import type * as GustoContext from '@gusto/embedded-api-v-2025-11-15/react-query/_context'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

// These tests exercise the client-side pagination state machine directly:
// page handlers (first/last/next/previous), per-page changes, and the
// safeCurrentPage clamping that activates when filtering shrinks the list
// below the current page.

// useClientPagination debounces search by 120ms; flush the timer inside act()
// so React processes the resulting state update before assertions.
const SEARCH_DEBOUNCE_MS = 120
function flushSearchDebounce() {
  act(() => {
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
  })
}

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

vi.mock('@gusto/embedded-api-v-2025-11-15/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: {
      showEmployees: employees,
      httpMeta: { response: { headers: new Headers() } },
    },
    isFetching: false,
  }),
  buildEmployeesListQuery: () => ({
    queryKey: ['noop'],
    queryFn: () => Promise.resolve({ showEmployees: [] }),
  }),
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
    useSuspenseQueries: () => [],
  }
})

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
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('initial state: page 1, default 5 items per page, total 12', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.itemsPerPage).toBe(5)
    expect(result.current.pagination.totalCount).toBe(12)
    expect(result.current.pagination.totalPages).toBe(3)
    expect(result.current.filteredEmployees).toHaveLength(5)
    expect(result.current.filteredEmployees[0]?.uuid).toBe('uuid-0')
  })

  test('handleNextPage advances by one and clamps at totalPages', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.filteredEmployees[0]?.uuid).toBe('uuid-5')

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    // Clamp: clicking next on the last page should stay at the last page.
    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    // Last page has the remaining 2 employees.
    expect(result.current.filteredEmployees).toHaveLength(2)
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

    // Clamp: clicking previous on page 1 should stay at 1.
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
    expect(result.current.filteredEmployees[0]?.uuid).toBe('uuid-0')
  })

  test('handleLastPage jumps to totalPages', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.filteredEmployees).toHaveLength(2)
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
    expect(result.current.filteredEmployees).toHaveLength(10)
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
    // Page should NOT reset back to 1 since itemsPerPage didn't change.
    expect(result.current.pagination.currentPage).toBe(2)
  })

  test('safeCurrentPage clamps when search filter shrinks results below current page', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    // Jump to the last page (3) where only 2 employees live.
    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    // Apply a search that matches only Employee0 — totalPages collapses to 1.
    // currentPage state is still 3, but pagination.currentPage should report
    // the clamped value (safeCurrentPage = 1) and filteredEmployees should
    // reflect that page.
    act(() => {
      result.current.handleSearchChange('Employee0 Test')
    })
    flushSearchDebounce()
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.filteredEmployees).toHaveLength(1)
    expect(result.current.filteredEmployees[0]?.uuid).toBe('uuid-0')
  })

  test('handleSearchChange resets currentPage to 1', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.handleSearchChange('Employee')
    })
    flushSearchDebounce()
    expect(result.current.pagination.currentPage).toBe(1)
  })

  test('handleSearchClear resets currentPage to 1', () => {
    const { result } = renderHook(() => useSelectEmployeesData('company-123'), { wrapper })

    act(() => {
      result.current.handleSearchChange('Employee')
    })
    flushSearchDebounce()
    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.handleSearchClear()
    })
    flushSearchDebounce()
    expect(result.current.pagination.currentPage).toBe(1)
  })
})
