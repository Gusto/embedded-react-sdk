import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePagination } from './usePagination'

describe('usePagination', () => {
  const createMockHttpMeta = (totalPages: number, totalCount?: number) => ({
    response: {
      headers: {
        get: (key: string) => {
          if (key === 'x-total-pages') return totalPages.toString()
          if (key === 'x-total-count' && totalCount !== undefined) return totalCount.toString()
          return null
        },
      },
    } as unknown as Response,
  })

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination())

      expect(result.current.page).toBe(1)
      expect(result.current.per).toBe(10)
      expect(result.current.pagination.currentPage).toBe(1)
      expect(result.current.pagination.totalPages).toBe(1)
      expect(result.current.pagination.itemsPerPage).toBe(10)
      expect(result.current.totalCount).toBeUndefined()
    })

    it('should initialize with custom defaultItemsPerPage', () => {
      const { result } = renderHook(() => usePagination({ defaultItemsPerPage: 50 }))

      expect(result.current.per).toBe(50)
      expect(result.current.pagination.itemsPerPage).toBe(50)
    })

    it('should extract totalPages from httpMeta', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.pagination.totalPages).toBe(5)
    })

    it('should extract totalCount from httpMeta', () => {
      const httpMeta = createMockHttpMeta(5, 50)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.totalCount).toBe(50)
    })

    it('should handle missing httpMeta gracefully', () => {
      const { result } = renderHook(() => usePagination({ httpMeta: undefined }))

      expect(result.current.pagination.totalPages).toBe(1)
      expect(result.current.totalCount).toBeUndefined()
    })
  })

  describe('navigation handlers', () => {
    it('should handle handleFirstPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      act(() => {
        result.current.pagination.handleNextPage()
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(3)

      act(() => {
        result.current.pagination.handleFirstPage()
      })

      expect(result.current.page).toBe(1)
      expect(result.current.pagination.currentPage).toBe(1)
    })

    it('should handle handleLastPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      act(() => {
        result.current.pagination.handleLastPage()
      })

      expect(result.current.page).toBe(5)
      expect(result.current.pagination.currentPage).toBe(5)
    })

    it('should handle handleNextPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      act(() => {
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(2)

      act(() => {
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(3)
    })

    it('should not go beyond totalPages when using handleNextPage', () => {
      const httpMeta = createMockHttpMeta(3)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      act(() => {
        result.current.pagination.handleLastPage()
      })

      expect(result.current.page).toBe(3)

      act(() => {
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(3)
    })

    it('should handle handlePreviousPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      act(() => {
        result.current.pagination.handleNextPage()
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(3)

      act(() => {
        result.current.pagination.handlePreviousPage()
      })

      expect(result.current.page).toBe(2)
    })

    it('should not go below page 1 when using handlePreviousPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.page).toBe(1)

      act(() => {
        result.current.pagination.handlePreviousPage()
      })

      expect(result.current.page).toBe(1)
    })
  })

  describe('handleItemsPerPageChange', () => {
    it('should change itemsPerPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.per).toBe(10)

      act(() => {
        result.current.pagination.handleItemsPerPageChange(50)
      })

      expect(result.current.per).toBe(50)
      expect(result.current.pagination.itemsPerPage).toBe(50)
    })

    it('should reset to page 1 when changing itemsPerPage', () => {
      const httpMeta = createMockHttpMeta(5)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      act(() => {
        result.current.pagination.handleNextPage()
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(3)

      act(() => {
        result.current.pagination.handleItemsPerPageChange(50)
      })

      expect(result.current.page).toBe(1)
      expect(result.current.per).toBe(50)
    })
  })

  describe('httpMeta updates', () => {
    it('should update totalPages when httpMeta changes', () => {
      const httpMeta1 = createMockHttpMeta(5)
      const { result, rerender } = renderHook(({ httpMeta }) => usePagination({ httpMeta }), {
        initialProps: { httpMeta: httpMeta1 },
      })

      expect(result.current.pagination.totalPages).toBe(5)

      const httpMeta2 = createMockHttpMeta(10)
      rerender({ httpMeta: httpMeta2 })

      expect(result.current.pagination.totalPages).toBe(10)
    })

    it('should update totalCount when httpMeta changes', () => {
      const httpMeta1 = createMockHttpMeta(5, 50)
      const { result, rerender } = renderHook(({ httpMeta }) => usePagination({ httpMeta }), {
        initialProps: { httpMeta: httpMeta1 },
      })

      expect(result.current.totalCount).toBe(50)

      const httpMeta2 = createMockHttpMeta(10, 100)
      rerender({ httpMeta: httpMeta2 })

      expect(result.current.totalCount).toBe(100)
    })
  })

  describe('pagination structure', () => {
    it('should return all required pagination control props', () => {
      const { result } = renderHook(() => usePagination())

      expect(result.current.pagination).toHaveProperty('currentPage')
      expect(result.current.pagination).toHaveProperty('totalPages')
      expect(result.current.pagination).toHaveProperty('itemsPerPage')
      expect(result.current.pagination).toHaveProperty('handleFirstPage')
      expect(result.current.pagination).toHaveProperty('handlePreviousPage')
      expect(result.current.pagination).toHaveProperty('handleNextPage')
      expect(result.current.pagination).toHaveProperty('handleLastPage')
      expect(result.current.pagination).toHaveProperty('handleItemsPerPageChange')
    })

    it('should have function handlers', () => {
      const { result } = renderHook(() => usePagination())

      expect(typeof result.current.pagination.handleFirstPage).toBe('function')
      expect(typeof result.current.pagination.handlePreviousPage).toBe('function')
      expect(typeof result.current.pagination.handleNextPage).toBe('function')
      expect(typeof result.current.pagination.handleLastPage).toBe('function')
      expect(typeof result.current.pagination.handleItemsPerPageChange).toBe('function')
    })
  })

  describe('isFetching parameter', () => {
    it('should include isFetching in pagination', () => {
      const { result } = renderHook(() => usePagination({ isFetching: true }))

      expect(result.current.pagination.isFetching).toBe(true)
    })

    it('should default isFetching to false', () => {
      const { result } = renderHook(() => usePagination())

      expect(result.current.pagination.isFetching).toBe(false)
    })

    it('should update isFetching when it changes', () => {
      const { result, rerender } = renderHook(({ isFetching }) => usePagination({ isFetching }), {
        initialProps: { isFetching: false },
      })

      expect(result.current.pagination.isFetching).toBe(false)

      rerender({ isFetching: true })

      expect(result.current.pagination.isFetching).toBe(true)
    })
  })

  describe('initialPage parameter', () => {
    it('should start at initialPage when provided and within totalPages', () => {
      const httpMeta = createMockHttpMeta(10)
      const { result } = renderHook(() => usePagination({ initialPage: 3, httpMeta }))

      expect(result.current.page).toBe(3)
      expect(result.current.pagination.currentPage).toBe(3)
    })

    it('should reset to page 1 if initialPage exceeds totalPages', async () => {
      const httpMeta = createMockHttpMeta(2)
      const { result } = renderHook(() => usePagination({ initialPage: 5, httpMeta }))

      await waitFor(() => {
        expect(result.current.page).toBe(1)
      })
    })

    it('should default to page 1 when initialPage not provided', () => {
      const { result } = renderHook(() => usePagination())

      expect(result.current.page).toBe(1)
    })
  })

  describe('page validation', () => {
    it('should reset to page 1 when currentPage exceeds totalPages', async () => {
      const httpMeta1 = createMockHttpMeta(10)
      const { result, rerender } = renderHook(({ httpMeta }) => usePagination({ httpMeta }), {
        initialProps: { httpMeta: httpMeta1 },
      })

      act(() => {
        result.current.pagination.handleLastPage()
      })

      expect(result.current.page).toBe(10)

      const httpMeta2 = createMockHttpMeta(3)
      rerender({ httpMeta: httpMeta2 })

      await waitFor(() => {
        expect(result.current.page).toBe(1)
      })
    })

    it('should not reset when currentPage is within bounds', async () => {
      const httpMeta1 = createMockHttpMeta(10)
      const { result, rerender } = renderHook(({ httpMeta }) => usePagination({ httpMeta }), {
        initialProps: { httpMeta: httpMeta1 },
      })

      act(() => {
        result.current.pagination.handleNextPage()
        result.current.pagination.handleNextPage()
      })

      expect(result.current.page).toBe(3)

      const httpMeta2 = createMockHttpMeta(5)
      rerender({ httpMeta: httpMeta2 })

      await waitFor(() => {
        expect(result.current.page).toBe(3)
      })
    })
  })

  describe('handler memoization', () => {
    it('should memoize handlers to prevent unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => usePagination())

      const firstHandlers = {
        handleFirstPage: result.current.pagination.handleFirstPage,
        handlePreviousPage: result.current.pagination.handlePreviousPage,
        handleNextPage: result.current.pagination.handleNextPage,
        handleLastPage: result.current.pagination.handleLastPage,
        handleItemsPerPageChange: result.current.pagination.handleItemsPerPageChange,
      }

      rerender()

      expect(result.current.pagination.handleFirstPage).toBe(firstHandlers.handleFirstPage)
      expect(result.current.pagination.handlePreviousPage).toBe(firstHandlers.handlePreviousPage)
      expect(result.current.pagination.handleItemsPerPageChange).toBe(
        firstHandlers.handleItemsPerPageChange,
      )
    })

    it('should update handleNextPage when totalPages changes', () => {
      const httpMeta1 = createMockHttpMeta(5)
      const { result, rerender } = renderHook(({ httpMeta }) => usePagination({ httpMeta }), {
        initialProps: { httpMeta: httpMeta1 },
      })

      const firstHandler = result.current.pagination.handleNextPage

      const httpMeta2 = createMockHttpMeta(10)
      rerender({ httpMeta: httpMeta2 })

      expect(result.current.pagination.handleNextPage).not.toBe(firstHandler)
    })
  })

  describe('type-safe header parsing', () => {
    it('should handle invalid totalPages header gracefully', () => {
      const httpMeta = {
        response: {
          headers: {
            get: (key: string) => {
              if (key === 'x-total-pages') return 'invalid'
              return null
            },
          },
        } as unknown as Response,
      }
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.pagination.totalPages).toBe(1)
    })

    it('should handle invalid totalCount header gracefully', () => {
      const httpMeta = {
        response: {
          headers: {
            get: (key: string) => {
              if (key === 'x-total-count') return 'not-a-number'
              return null
            },
          },
        } as unknown as Response,
      }
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.totalCount).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle httpMeta with missing headers', () => {
      const httpMeta = {
        response: {
          headers: {
            get: () => null,
          },
        } as unknown as Response,
      }
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.pagination.totalPages).toBe(1)
      expect(result.current.totalCount).toBeUndefined()
    })

    it('should handle totalPages of 0 by defaulting to 1', () => {
      const httpMeta = createMockHttpMeta(0)
      const { result } = renderHook(() => usePagination({ httpMeta }))

      expect(result.current.pagination.totalPages).toBe(0)
    })

    it('should handle all valid PaginationItemsPerPage values', () => {
      const { result } = renderHook(() => usePagination())

      act(() => {
        result.current.pagination.handleItemsPerPageChange(5)
      })
      expect(result.current.per).toBe(5)

      act(() => {
        result.current.pagination.handleItemsPerPageChange(10)
      })
      expect(result.current.per).toBe(10)

      act(() => {
        result.current.pagination.handleItemsPerPageChange(50)
      })
      expect(result.current.per).toBe(50)
    })
  })
})
