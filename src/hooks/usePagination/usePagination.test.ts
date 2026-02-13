import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { usePagination } from './usePagination'

const createHeaders = (totalPages: number, totalCount: number) => {
  const headers = new Headers()
  headers.set('x-total-pages', String(totalPages))
  headers.set('x-total-count', String(totalCount))
  return headers
}

describe('usePagination', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination())

    expect(result.current.currentPage).toBe(1)
    expect(result.current.itemsPerPage).toBe(5)
  })

  test('should accept a custom defaultItemsPerPage', () => {
    const { result } = renderHook(() => usePagination({ defaultItemsPerPage: 10 }))

    expect(result.current.itemsPerPage).toBe(10)
  })

  test('should extract totalPages and totalCount from headers', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 42)

    const props = result.current.getPaginationProps(headers)

    expect(props.totalPages).toBe(5)
    expect(props.totalCount).toBe(42)
  })

  test('should default totalPages to 1 and totalCount to 0 for empty headers', () => {
    const { result } = renderHook(() => usePagination())

    const props = result.current.getPaginationProps(new Headers())

    expect(props.totalPages).toBe(1)
    expect(props.totalCount).toBe(0)
  })

  test('should pass through isFetching', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(1, 0)

    expect(result.current.getPaginationProps(headers).isFetching).toBeUndefined()
    expect(result.current.getPaginationProps(headers, true).isFetching).toBe(true)
    expect(result.current.getPaginationProps(headers, false).isFetching).toBe(false)
  })

  test('handleNextPage should advance the page', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })

    expect(result.current.currentPage).toBe(2)
  })

  test('handleNextPage should not exceed totalPages', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(2, 10)

    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })

    expect(result.current.currentPage).toBe(2)
  })

  test('handlePreviousPage should go back one page', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    // Go to page 3
    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    expect(result.current.currentPage).toBe(3)

    act(() => {
      result.current.getPaginationProps(headers).handlePreviousPage()
    })

    expect(result.current.currentPage).toBe(2)
  })

  test('handlePreviousPage should not go below 1', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    act(() => {
      result.current.getPaginationProps(headers).handlePreviousPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  test('handleFirstPage should go to page 1', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    // Go to page 3
    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    expect(result.current.currentPage).toBe(3)

    act(() => {
      result.current.getPaginationProps(headers).handleFirstPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  test('handleLastPage should go to the last page', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    act(() => {
      result.current.getPaginationProps(headers).handleLastPage()
    })

    expect(result.current.currentPage).toBe(5)
  })

  test('handleItemsPerPageChange should update itemsPerPage', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    act(() => {
      result.current.getPaginationProps(headers).handleItemsPerPageChange(50)
    })

    expect(result.current.itemsPerPage).toBe(50)
  })

  test('handleItemsPerPageChange should reset currentPage to 1', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(10, 100)

    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
      result.current.getPaginationProps(headers).handleNextPage()
      result.current.getPaginationProps(headers).handleNextPage()
    })
    expect(result.current.currentPage).toBe(4)

    act(() => {
      result.current.getPaginationProps(headers).handleItemsPerPageChange(50)
    })

    expect(result.current.currentPage).toBe(1)
    expect(result.current.itemsPerPage).toBe(50)
  })

  test('handleItemsPerPageChange should not reset page if value is unchanged', () => {
    const { result } = renderHook(() => usePagination({ defaultItemsPerPage: 10 }))
    const headers = createHeaders(10, 100)

    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
      result.current.getPaginationProps(headers).handleNextPage()
    })
    expect(result.current.currentPage).toBe(3)

    act(() => {
      result.current.getPaginationProps(headers).handleItemsPerPageChange(10)
    })

    expect(result.current.currentPage).toBe(3)
    expect(result.current.itemsPerPage).toBe(10)
  })

  test('getPaginationProps should reflect current state', () => {
    const { result } = renderHook(() => usePagination())
    const headers = createHeaders(5, 25)

    act(() => {
      result.current.getPaginationProps(headers).handleNextPage()
    })
    expect(result.current.currentPage).toBe(2)

    act(() => {
      result.current.getPaginationProps(headers).handleItemsPerPageChange(10)
    })

    const props = result.current.getPaginationProps(headers)

    expect(props.currentPage).toBe(1)
    expect(props.itemsPerPage).toBe(10)
    expect(props.totalPages).toBe(5)
    expect(props.totalCount).toBe(25)
  })

  test('handlers should use latest totalPages value (no stale closures)', () => {
    const { result } = renderHook(() => usePagination())
    const headers1 = createHeaders(5, 25)

    const firstProps = result.current.getPaginationProps(headers1)

    const headers2 = createHeaders(10, 50)
    result.current.getPaginationProps(headers2)

    act(() => {
      firstProps.handleLastPage()
    })

    expect(result.current.currentPage).toBe(10)
  })

  test('handleNextPage should respect updated totalPages from stored handler', () => {
    const { result } = renderHook(() => usePagination())
    const headers1 = createHeaders(3, 15)

    const firstProps = result.current.getPaginationProps(headers1)

    act(() => {
      firstProps.handleNextPage()
      firstProps.handleNextPage()
    })
    expect(result.current.currentPage).toBe(3)

    const headers2 = createHeaders(5, 25)
    result.current.getPaginationProps(headers2)

    act(() => {
      firstProps.handleNextPage()
    })

    expect(result.current.currentPage).toBe(4)
  })
})
