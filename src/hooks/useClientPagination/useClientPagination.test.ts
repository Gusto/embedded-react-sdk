import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { useClientPagination } from './useClientPagination'

interface FakeItem {
  uuid: string
  firstName: string
  lastName: string
}

function makeItem(index: number): FakeItem {
  return { uuid: `uuid-${index}`, firstName: `First${index}`, lastName: `Last${index}` }
}

const matchesName = (item: FakeItem, query: string) =>
  `${item.firstName} ${item.lastName}`.toLowerCase().includes(query.toLowerCase())

// 12 items fits cleanly into "5 per page" → 3 pages (5/5/2).
const items = Array.from({ length: 12 }, (_, i) => makeItem(i))

describe('useClientPagination', () => {
  test('initial state: page 1, default 5 per page, totalCount = items.length', () => {
    const { result } = renderHook(() => useClientPagination(items))

    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.itemsPerPage).toBe(5)
    expect(result.current.pagination.totalCount).toBe(12)
    expect(result.current.pagination.totalPages).toBe(3)
    expect(result.current.data).toHaveLength(5)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
    expect(result.current.searchValue).toBe('')
  })

  test('accepts a custom defaultItemsPerPage', () => {
    const { result } = renderHook(() => useClientPagination(items, { defaultItemsPerPage: 10 }))

    expect(result.current.pagination.itemsPerPage).toBe(10)
    expect(result.current.pagination.totalPages).toBe(2)
    expect(result.current.data).toHaveLength(10)
  })

  test('handleNextPage advances by one and clamps at totalPages', () => {
    const { result } = renderHook(() => useClientPagination(items))

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.data[0]?.uuid).toBe('uuid-5')

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.data).toHaveLength(2)

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
  })

  test('handlePreviousPage decrements by one and clamps at 1', () => {
    const { result } = renderHook(() => useClientPagination(items))

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

  test('handleFirstPage and handleLastPage jump to the boundaries', () => {
    const { result } = renderHook(() => useClientPagination(items))

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.data).toHaveLength(2)

    act(() => {
      result.current.pagination.handleFirstPage()
    })
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
  })

  test('handleItemsPerPageChange resets to page 1 and recomputes totalPages', () => {
    const { result } = renderHook(() => useClientPagination(items))

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
    expect(result.current.data).toHaveLength(10)
  })

  test('handleItemsPerPageChange is a no-op when value matches current', () => {
    const { result } = renderHook(() => useClientPagination(items))

    act(() => {
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)

    act(() => {
      result.current.pagination.handleItemsPerPageChange(5)
    })
    expect(result.current.pagination.currentPage).toBe(2)
  })

  test('searchPredicate filters allItems and resets currentPage to 1', () => {
    const { result } = renderHook(() =>
      useClientPagination(items, { searchPredicate: matchesName }),
    )

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    act(() => {
      result.current.actions.onSearchChange('First0 Last0')
    })

    expect(result.current.searchValue).toBe('First0 Last0')
    expect(result.current.pagination.totalCount).toBe(1)
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
  })

  test('onSearchClear restores the unfiltered list and resets to page 1', () => {
    const { result } = renderHook(() =>
      useClientPagination(items, { searchPredicate: matchesName }),
    )

    act(() => {
      result.current.actions.onSearchChange('First9 Last9')
    })
    expect(result.current.pagination.totalCount).toBe(1)

    act(() => {
      result.current.actions.onSearchClear()
    })
    expect(result.current.searchValue).toBe('')
    expect(result.current.pagination.totalCount).toBe(12)
    expect(result.current.pagination.currentPage).toBe(1)
  })

  test('safeCurrentPage clamps when allItems shrinks below the current page', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: FakeItem[] }) => useClientPagination(data),
      { initialProps: { data: items } },
    )

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)

    rerender({ data: items.slice(0, 1) })

    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
  })

  test('handles an empty array without dividing by zero', () => {
    const { result } = renderHook(() => useClientPagination<FakeItem>([]))

    expect(result.current.pagination.totalCount).toBe(0)
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data).toHaveLength(0)
  })
})

describe('useClientPagination — boundary math', () => {
  test('exact-page totals: 10 items at 5/page is exactly 2 pages, not 3', () => {
    const exact = Array.from({ length: 10 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(exact))

    expect(result.current.pagination.totalPages).toBe(2)

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(2)
    expect(result.current.data).toHaveLength(5)
    expect(result.current.data[4]?.uuid).toBe('uuid-9')
  })

  test('supports itemsPerPage = 50', () => {
    const big = Array.from({ length: 125 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(big, { defaultItemsPerPage: 50 }))

    expect(result.current.pagination.itemsPerPage).toBe(50)
    expect(result.current.pagination.totalPages).toBe(3)
    expect(result.current.data).toHaveLength(50)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
    expect(result.current.data[49]?.uuid).toBe('uuid-49')

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.data).toHaveLength(25)
    expect(result.current.data[0]?.uuid).toBe('uuid-100')
    expect(result.current.data[24]?.uuid).toBe('uuid-124')
  })

  test('handleItemsPerPageChange returns the correct slice of items', () => {
    const { result } = renderHook(() => useClientPagination(items))

    act(() => {
      result.current.pagination.handleLastPage()
    })

    act(() => {
      result.current.pagination.handleItemsPerPageChange(10)
    })

    expect(result.current.data).toHaveLength(10)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
    expect(result.current.data[9]?.uuid).toBe('uuid-9')
  })

  test('switching itemsPerPage larger than totalCount lands on a single-page result', () => {
    const small = Array.from({ length: 3 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(small))

    act(() => {
      result.current.pagination.handleItemsPerPageChange(50)
    })

    expect(result.current.pagination.itemsPerPage).toBe(50)
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data).toHaveLength(3)
  })

  test('page handlers are safe no-ops on a single-page non-empty list', () => {
    const small = Array.from({ length: 2 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(small))

    expect(result.current.pagination.totalPages).toBe(1)

    act(() => {
      result.current.pagination.handleNextPage()
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data).toHaveLength(2)
  })
})

describe('useClientPagination — large dataset', () => {
  test('handles 10,000 items: counts, last-page slice, middle-page slice', () => {
    const huge = Array.from({ length: 10_000 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(huge, { defaultItemsPerPage: 50 }))

    expect(result.current.pagination.totalCount).toBe(10_000)
    expect(result.current.pagination.totalPages).toBe(200)
    expect(result.current.data).toHaveLength(50)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')

    act(() => {
      result.current.pagination.handleLastPage()
    })
    expect(result.current.pagination.currentPage).toBe(200)
    expect(result.current.data).toHaveLength(50)
    expect(result.current.data[0]?.uuid).toBe('uuid-9950')
    expect(result.current.data[49]?.uuid).toBe('uuid-9999')

    act(() => {
      result.current.pagination.handleFirstPage()
      result.current.pagination.handleNextPage()
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(3)
    expect(result.current.data[0]?.uuid).toBe('uuid-100')
    expect(result.current.data[49]?.uuid).toBe('uuid-149')
  })
})

describe('useClientPagination — search', () => {
  test('zero matches: totalCount 0, totalPages 1, data empty, currentPage 1', () => {
    const { result } = renderHook(() =>
      useClientPagination(items, { searchPredicate: matchesName }),
    )

    act(() => {
      result.current.actions.onSearchChange('nope-not-a-real-name')
    })

    expect(result.current.pagination.totalCount).toBe(0)
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.data).toHaveLength(0)
  })

  test('refining a query mid-pagination clamps currentPage via safeCurrentPage', () => {
    const big = Array.from({ length: 30 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(big, { searchPredicate: matchesName }))

    act(() => {
      result.current.pagination.handleNextPage()
      result.current.pagination.handleNextPage()
      result.current.pagination.handleNextPage()
    })
    expect(result.current.pagination.currentPage).toBe(4)

    act(() => {
      result.current.actions.onSearchChange('First1')
    })

    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.totalCount).toBe(11)
    expect(result.current.pagination.totalPages).toBe(3)
  })

  test('predicate receives the trimmed deferred value and the item', () => {
    const predicate = vi.fn<(item: FakeItem, query: string) => boolean>(() => true)
    const { result } = renderHook(() => useClientPagination(items, { searchPredicate: predicate }))

    expect(predicate).not.toHaveBeenCalled()

    act(() => {
      result.current.actions.onSearchChange('  Smith  ')
    })

    expect(predicate).toHaveBeenCalled()
    for (const call of predicate.mock.calls) {
      expect(call[1]).toBe('Smith')
    }
    expect(predicate.mock.calls[0]?.[0]).toMatchObject({ uuid: 'uuid-0' })
  })

  test('whitespace-only search is treated as no search (predicate not called)', () => {
    const predicate = vi.fn<(item: FakeItem, query: string) => boolean>(() => false)
    const { result } = renderHook(() => useClientPagination(items, { searchPredicate: predicate }))

    act(() => {
      result.current.actions.onSearchChange('   ')
    })

    expect(predicate).not.toHaveBeenCalled()
    expect(result.current.pagination.totalCount).toBe(12)
    expect(result.current.data).toHaveLength(5)
    expect(result.current.searchValue).toBe('   ')
  })

  test('successive queries re-filter against each new deferred value', () => {
    const { result } = renderHook(() =>
      useClientPagination(items, { searchPredicate: matchesName }),
    )

    act(() => {
      result.current.actions.onSearchChange('First1')
    })
    expect(result.current.pagination.totalCount).toBe(3)

    act(() => {
      result.current.actions.onSearchChange('First11')
    })
    expect(result.current.pagination.totalCount).toBe(1)
    expect(result.current.data[0]?.uuid).toBe('uuid-11')

    act(() => {
      result.current.actions.onSearchChange('zzz-no-match')
    })
    expect(result.current.pagination.totalCount).toBe(0)

    act(() => {
      result.current.actions.onSearchChange('First2')
    })
    expect(result.current.pagination.totalCount).toBe(1)
    expect(result.current.data[0]?.uuid).toBe('uuid-2')
  })

  test('search + itemsPerPage change cooperate', () => {
    const big = Array.from({ length: 30 }, (_, i) => makeItem(i))
    const { result } = renderHook(() => useClientPagination(big, { searchPredicate: matchesName }))

    act(() => {
      result.current.actions.onSearchChange('First1')
    })
    expect(result.current.pagination.totalCount).toBe(11)
    expect(result.current.pagination.totalPages).toBe(3)

    act(() => {
      result.current.pagination.handleItemsPerPageChange(50)
    })

    expect(result.current.pagination.itemsPerPage).toBe(50)
    expect(result.current.pagination.totalPages).toBe(1)
    expect(result.current.data).toHaveLength(11)
  })

  test('updating only the predicate identity re-filters with the same query', () => {
    const big = Array.from({ length: 20 }, (_, i) => makeItem(i))
    type Hookprops = { predicate: (item: FakeItem, query: string) => boolean }
    const { result, rerender } = renderHook(
      ({ predicate }: Hookprops) => useClientPagination(big, { searchPredicate: predicate }),
      { initialProps: { predicate: matchesName } satisfies Hookprops },
    )

    act(() => {
      result.current.actions.onSearchChange('First1')
    })
    expect(result.current.pagination.totalCount).toBe(11)

    rerender({ predicate: () => false })

    expect(result.current.pagination.totalCount).toBe(0)
    expect(result.current.data).toHaveLength(0)
  })
})

describe('useClientPagination — referential stability', () => {
  test('data and pagination identity are stable across no-op rerenders', () => {
    const stable = Array.from({ length: 8 }, (_, i) => makeItem(i))
    const { result, rerender } = renderHook(
      ({ data }: { data: FakeItem[] }) => useClientPagination(data),
      { initialProps: { data: stable } },
    )

    const firstData = result.current.data
    const firstPagination = result.current.pagination

    rerender({ data: stable })

    expect(result.current.data).toBe(firstData)
    expect(result.current.pagination).toBe(firstPagination)
  })

  test('a new allItems reference re-derives data and pagination', () => {
    const stable = Array.from({ length: 8 }, (_, i) => makeItem(i))
    const { result, rerender } = renderHook(
      ({ data }: { data: FakeItem[] }) => useClientPagination(data),
      { initialProps: { data: stable } },
    )

    const firstData = result.current.data

    rerender({ data: [...stable] })

    expect(result.current.data).not.toBe(firstData)
    expect(result.current.data).toHaveLength(5)
    expect(result.current.data[0]?.uuid).toBe('uuid-0')
  })
})
