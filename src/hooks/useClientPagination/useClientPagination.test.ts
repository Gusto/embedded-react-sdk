import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
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
