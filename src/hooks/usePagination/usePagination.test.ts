import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination, extractPaginationMeta } from './usePagination'

const createMockHttpMeta = (headers: Record<string, string> = {}) => ({
  response: {
    headers: new Headers(headers),
  } as Response,
})

describe('extractPaginationMeta', () => {
  test('extracts totalPages from x-total-pages header', () => {
    const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalPages).toBe(5)
  })

  test('extracts totalItems from x-total-count header', () => {
    const httpMeta = createMockHttpMeta({ 'x-total-count': '42' })
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalItems).toBe(42)
  })

  test('defaults totalPages to 1 when header missing', () => {
    const httpMeta = createMockHttpMeta({})
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalPages).toBe(1)
  })

  test('defaults totalItems to 0 when header missing', () => {
    const httpMeta = createMockHttpMeta({})
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalItems).toBe(0)
  })

  test('defaults totalPages to 1 when header is invalid', () => {
    const httpMeta = createMockHttpMeta({ 'x-total-pages': 'invalid' })
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalPages).toBe(1)
  })

  test('defaults totalItems to 0 when header is invalid', () => {
    const httpMeta = createMockHttpMeta({ 'x-total-count': 'abc' })
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalItems).toBe(0)
  })

  test('defaults totalPages to 1 when header is empty string', () => {
    const httpMeta = createMockHttpMeta({ 'x-total-pages': '' })
    const result = extractPaginationMeta(httpMeta)
    expect(result.totalPages).toBe(1)
  })
})

describe('usePagination', () => {
  describe('initial state', () => {
    test('defaults currentPage to 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta))
      expect(result.current.currentPage).toBe(1)
    })

    test('defaults itemsPerPage to 5', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta))
      expect(result.current.itemsPerPage).toBe(5)
    })

    test('uses initialPage from options', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 3 }))
      expect(result.current.currentPage).toBe(3)
    })

    test('uses initialItemsPerPage from options', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialItemsPerPage: 50 }))
      expect(result.current.itemsPerPage).toBe(50)
    })
  })

  describe('navigation handlers', () => {
    test('handleFirstPage sets page to 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 3 }))

      act(() => {
        result.current.handleFirstPage()
      })

      expect(result.current.currentPage).toBe(1)
    })

    test('handlePreviousPage decrements page', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 3 }))

      act(() => {
        result.current.handlePreviousPage()
      })

      expect(result.current.currentPage).toBe(2)
    })

    test('handleNextPage increments page', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 3 }))

      act(() => {
        result.current.handleNextPage()
      })

      expect(result.current.currentPage).toBe(4)
    })

    test('handleLastPage sets page to totalPages', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta))

      act(() => {
        result.current.handleLastPage()
      })

      expect(result.current.currentPage).toBe(5)
    })

    test('handleItemsPerPageChange updates itemsPerPage and resets to page 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 3 }))

      act(() => {
        result.current.handleItemsPerPageChange(50)
      })

      expect(result.current.itemsPerPage).toBe(50)
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('handlePreviousPage on page 1 stays on page 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 1 }))

      act(() => {
        result.current.handlePreviousPage()
      })

      expect(result.current.currentPage).toBe(1)
    })

    test('handleNextPage on last page stays on last page', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5' })
      const { result } = renderHook(() => usePagination(httpMeta, { initialPage: 5 }))

      act(() => {
        result.current.handleNextPage()
      })

      expect(result.current.currentPage).toBe(5)
    })
  })

  describe('header extraction', () => {
    test('returns totalPages from httpMeta', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '10', 'x-total-count': '100' })
      const { result } = renderHook(() => usePagination(httpMeta))
      expect(result.current.totalPages).toBe(10)
    })

    test('returns totalItems from httpMeta', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '10', 'x-total-count': '100' })
      const { result } = renderHook(() => usePagination(httpMeta))
      expect(result.current.totalItems).toBe(100)
    })
  })
})
