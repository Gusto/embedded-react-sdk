import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type * as ReactQuery from '@tanstack/react-query'
import type * as GustoContext from '@gusto/embedded-api/react-query/_context'
import type { ReactNode } from 'react'
import { useSelectContractors } from './useSelectContractors'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { ContractorOnboardingStatus } from '@/shared/constants'

// These tests exercise the client-side pagination state machine and the
// onSelectAll scoping behavior directly: page handlers, per-page
// changes, and "select all" always scoping to the full eligible +
// search-filtered list across every page, not just the visible page slice.

const SEARCH_DEBOUNCE_MS = 120
function flushSearchDebounce() {
  act(() => {
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
  })
}

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

function makeContractor(index: number) {
  return {
    uuid: `uuid-${index}`,
    isActive: true,
    onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED,
    firstName: `Contractor${index}`,
    lastName: 'Test',
  }
}

// 52 contractors fits cleanly into "25 per page" → 3 pages (25/25/2).
const contractors = Array.from({ length: 52 }, (_, i) => makeContractor(i))

vi.mock('@gusto/embedded-api/react-query/contractorsList', () => ({
  useContractorsList: () => ({
    data: {
      contractors,
      httpMeta: { response: { headers: new Headers() } },
    },
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  buildContractorsListQuery: () => ({
    queryKey: ['noop'],
    queryFn: () => Promise.resolve({ contractors: [] }),
  }),
}))

vi.mock('@gusto/embedded-api/react-query/_context', async importOriginal => {
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
    useQueries: () => [],
  }
})

function wrapper({ children }: { children: ReactNode }) {
  return <GustoTestProvider>{children}</GustoTestProvider>
}

function ready(current: ReturnType<typeof useSelectContractors>) {
  if (current.isLoading) throw new Error('expected ready state')
  return current
}

describe('useSelectContractors pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('initial state: page 1, default 25 items per page, total 52', () => {
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })
    const current = ready(result.current)
    expect(current.pagination.currentPage).toBe(1)
    expect(current.pagination.itemsPerPage).toBe(25)
    expect(current.pagination.totalCount).toBe(52)
    expect(current.pagination.totalPages).toBe(3)
    expect(current.data.contractors).toHaveLength(25)
    expect(current.data.contractors[0]?.uuid).toBe('uuid-0')
  })

  test('handleNextPage advances by one and clamps at totalPages', () => {
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    act(() => {
      ready(result.current).pagination.handleNextPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(2)

    act(() => {
      ready(result.current).pagination.handleNextPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(3)

    act(() => {
      ready(result.current).pagination.handleNextPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(3)
    expect(ready(result.current).data.contractors).toHaveLength(2)
  })

  test('handlePreviousPage decrements by one and clamps at 1', () => {
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    act(() => {
      ready(result.current).pagination.handleLastPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(3)

    act(() => {
      ready(result.current).pagination.handlePreviousPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(2)

    act(() => {
      ready(result.current).pagination.handlePreviousPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(1)

    act(() => {
      ready(result.current).pagination.handlePreviousPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(1)
  })

  test('handleItemsPerPageChange resets to page 1 and recomputes totalPages', () => {
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    act(() => {
      ready(result.current).pagination.handleLastPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(3)

    act(() => {
      ready(result.current).pagination.handleItemsPerPageChange(10)
    })
    const current = ready(result.current)
    expect(current.pagination.itemsPerPage).toBe(10)
    expect(current.pagination.totalPages).toBe(6)
    expect(current.pagination.currentPage).toBe(1)
    expect(current.data.contractors).toHaveLength(10)
  })

  test('onSearchChange resets currentPage to 1', () => {
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    act(() => {
      ready(result.current).pagination.handleNextPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(2)

    act(() => {
      ready(result.current).actions.onSearchChange('Contractor')
    })
    flushSearchDebounce()
    expect(ready(result.current).pagination.currentPage).toBe(1)
  })

  test('onSearchClear resets currentPage to 1', () => {
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    act(() => {
      ready(result.current).actions.onSearchChange('Contractor')
    })
    flushSearchDebounce()
    act(() => {
      ready(result.current).pagination.handleNextPage()
    })
    expect(ready(result.current).pagination.currentPage).toBe(2)

    act(() => {
      ready(result.current).actions.onSearchClear()
    })
    flushSearchDebounce()
    expect(ready(result.current).pagination.currentPage).toBe(1)
  })

  describe('onSelectAll scope', () => {
    test('selects every eligible contractor across all pages when no search is active', () => {
      const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

      // Stay on page 1 (25 of 52 visible) — select-all should still grab all 52.
      act(() => {
        ready(result.current).actions.onSelectAll(true)
      })

      const current = ready(result.current)
      expect(current.selectedIds.size).toBe(52)
      for (let i = 0; i < 52; i++) {
        expect(current.selectedIds.has(`uuid-${i}`)).toBe(true)
      }
    })

    test('unselects every eligible contractor across all pages', () => {
      const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

      act(() => {
        ready(result.current).actions.onSelectAll(true)
      })
      expect(ready(result.current).selectedIds.size).toBe(52)

      act(() => {
        ready(result.current).actions.onSelectAll(false)
      })
      expect(ready(result.current).selectedIds.size).toBe(0)
    })

    test('with a search active, selects only contractors matching the search across all pages', () => {
      const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

      // "Contractor1" matches Contractor1, Contractor10–Contractor19 — 11 contractors.
      act(() => {
        ready(result.current).actions.onSearchChange('Contractor1')
      })
      flushSearchDebounce()
      expect(ready(result.current).pagination.totalCount).toBe(11)

      act(() => {
        ready(result.current).actions.onSelectAll(true)
      })

      const current = ready(result.current)
      expect(current.selectedIds.size).toBe(11)
      expect(current.selectedIds.has('uuid-1')).toBe(true)
      expect(current.selectedIds.has('uuid-10')).toBe(true)
      expect(current.selectedIds.has('uuid-11')).toBe(true)
    })

    test('with a search active, unselect-all only unselects contractors matching the search', () => {
      const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

      // First select everyone with no search.
      act(() => {
        ready(result.current).actions.onSelectAll(true)
      })
      expect(ready(result.current).selectedIds.size).toBe(52)

      // Then apply a search for "Contractor1" (matches uuid-1, uuid-10–uuid-19 = 11)
      // and unselect all matching — leaves 41 contractors still selected.
      act(() => {
        ready(result.current).actions.onSearchChange('Contractor1')
      })
      flushSearchDebounce()
      act(() => {
        ready(result.current).actions.onSelectAll(false)
      })

      const current = ready(result.current)
      expect(current.selectedIds.size).toBe(41)
      expect(current.selectedIds.has('uuid-1')).toBe(false)
      expect(current.selectedIds.has('uuid-10')).toBe(false)
      expect(current.selectedIds.has('uuid-11')).toBe(false)
      expect(current.selectedIds.has('uuid-0')).toBe(true)
      expect(current.selectedIds.has('uuid-9')).toBe(true)
    })
  })
})
