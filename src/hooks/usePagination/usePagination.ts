import { useState, useMemo, useCallback, useEffect } from 'react'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

const parseHeaderNumber = (value: string | null, fallback: number): number => {
  if (!value) return fallback
  const parsed = Number(value)
  return isNaN(parsed) ? fallback : parsed
}

export interface UsePaginationParams {
  httpMeta?: { response: Response }
  isFetching?: boolean
  defaultItemsPerPage?: PaginationItemsPerPage
  initialPage?: number
}

/**
 * Hook for managing pagination state and extracting pagination metadata from API responses.
 *
 * @param httpMeta - Response metadata containing pagination headers (x-total-pages, x-total-count)
 * @param isFetching - Loading state to pass through to pagination controls
 * @param defaultItemsPerPage - Initial items per page (default: 10, API default: 25)
 * @param initialPage - Initial page number (default: 1)
 *
 * @returns Pagination state with page/per for API calls and paginationProps for UI
 *
 * @remarks
 * Default page size is 10 (not 25 like the API) for better mobile UX and consistency
 * with existing components. The hook automatically validates and resets the current page
 * when it exceeds the total pages (e.g., after filtering reduces result set).
 */

export interface UsePaginationReturn {
  page: number
  per: PaginationItemsPerPage
  pagination: PaginationControlProps
  totalCount?: number
}

export const usePagination = ({
  httpMeta,
  isFetching = false,
  defaultItemsPerPage = 10,
  initialPage = 1,
}: UsePaginationParams = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(defaultItemsPerPage)

  const totalPages = useMemo(() => {
    if (!httpMeta) return 1
    return parseHeaderNumber(httpMeta.response.headers.get('x-total-pages'), 1)
  }, [httpMeta])

  const totalCount = useMemo(() => {
    if (!httpMeta) return undefined
    const count = httpMeta.response.headers.get('x-total-count')
    if (!count) return undefined
    const parsed = parseHeaderNumber(count, 0)
    return parsed > 0 ? parsed : undefined
  }, [httpMeta])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const handleLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  const handleNextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }, [totalPages])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }, [])

  const handleItemsPerPageChange = useCallback((newCount: PaginationItemsPerPage) => {
    setItemsPerPage(newCount)
    setCurrentPage(1)
  }, [])

  const paginationProps: PaginationControlProps = useMemo(
    () => ({
      currentPage,
      totalPages,
      itemsPerPage,
      handleFirstPage,
      handlePreviousPage,
      handleNextPage,
      handleLastPage,
      handleItemsPerPageChange,
      isFetching,
    }),
    [
      currentPage,
      totalPages,
      itemsPerPage,
      handleFirstPage,
      handlePreviousPage,
      handleNextPage,
      handleLastPage,
      handleItemsPerPageChange,
      isFetching,
    ],
  )

  return {
    page: currentPage,
    per: itemsPerPage,
    pagination: paginationProps,
    totalCount,
  }
}
