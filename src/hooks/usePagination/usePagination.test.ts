import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination, extractPaginationMeta } from './usePagination'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'

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
})

describe('usePagination', () => {
  const createState = (
    overrides: Partial<{
      currentPage: number
      itemsPerPage: PaginationItemsPerPage
      setCurrentPage: React.Dispatch<React.SetStateAction<number>>
      setItemsPerPage: React.Dispatch<React.SetStateAction<PaginationItemsPerPage>>
    }> = {},
  ) => ({
    currentPage: 1,
    itemsPerPage: 10 as PaginationItemsPerPage,
    setCurrentPage: vi.fn(),
    setItemsPerPage: vi.fn(),
    ...overrides,
  })

  describe('state management', () => {
    test('returns currentPage from state', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const state = createState({ currentPage: 3 })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      expect(result.current.currentPage).toBe(3)
    })

    test('returns itemsPerPage from state', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const state = createState({ itemsPerPage: 50 })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      expect(result.current.itemsPerPage).toBe(50)
    })

    test('handleFirstPage sets page to 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const state = createState({ currentPage: 3, setCurrentPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handleFirstPage()
      })

      expect(setCurrentPage).toHaveBeenCalledWith(1)
    })

    test('handlePreviousPage decrements page', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const state = createState({ currentPage: 3, setCurrentPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handlePreviousPage()
      })

      expect(setCurrentPage).toHaveBeenCalled()
      const call = setCurrentPage.mock.calls[0]
      expect(call).toBeDefined()
      const updateFn = call![0] as (prev: number) => number
      expect(updateFn(3)).toBe(2)
    })

    test('handleNextPage increments page', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const state = createState({ currentPage: 3, setCurrentPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handleNextPage()
      })

      expect(setCurrentPage).toHaveBeenCalled()
      const call = setCurrentPage.mock.calls[0]
      expect(call).toBeDefined()
      const updateFn = call![0] as (prev: number) => number
      expect(updateFn(3)).toBe(4)
    })

    test('handleLastPage sets page to totalPages', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const state = createState({ setCurrentPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handleLastPage()
      })

      expect(setCurrentPage).toHaveBeenCalledWith(5)
    })

    test('handleItemsPerPageChange updates itemsPerPage and resets to page 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const setItemsPerPage = vi.fn()
      const state = createState({ currentPage: 3, setCurrentPage, setItemsPerPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handleItemsPerPageChange(50)
      })

      expect(setItemsPerPage).toHaveBeenCalledWith(50)
      expect(setCurrentPage).toHaveBeenCalledWith(1)
    })
  })

  describe('edge cases', () => {
    test('handlePreviousPage on page 1 stays on page 1', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const state = createState({ currentPage: 1, setCurrentPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handlePreviousPage()
      })

      const call = setCurrentPage.mock.calls[0]
      expect(call).toBeDefined()
      const updateFn = call![0] as (prev: number) => number
      expect(updateFn(1)).toBe(1)
    })

    test('handleNextPage on last page stays on last page', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '5', 'x-total-count': '50' })
      const setCurrentPage = vi.fn()
      const state = createState({ currentPage: 5, setCurrentPage })

      const { result } = renderHook(() => usePagination(httpMeta, state))

      act(() => {
        result.current.handleNextPage()
      })

      const call = setCurrentPage.mock.calls[0]
      expect(call).toBeDefined()
      const updateFn = call![0] as (prev: number) => number
      expect(updateFn(5)).toBe(5)
    })
  })

  describe('header extraction', () => {
    test('returns totalPages from httpMeta', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '10', 'x-total-count': '100' })
      const state = createState()

      const { result } = renderHook(() => usePagination(httpMeta, state))

      expect(result.current.totalPages).toBe(10)
    })

    test('returns totalItems from httpMeta', () => {
      const httpMeta = createMockHttpMeta({ 'x-total-pages': '10', 'x-total-count': '100' })
      const state = createState()

      const { result } = renderHook(() => usePagination(httpMeta, state))

      expect(result.current.totalItems).toBe(100)
    })
  })
})
