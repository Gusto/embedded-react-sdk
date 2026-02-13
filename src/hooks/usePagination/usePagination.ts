import { useState } from 'react'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

interface UsePaginationOptions {
  defaultItemsPerPage?: PaginationItemsPerPage
}

type PaginationProps = Required<Pick<PaginationControlProps, 'totalCount' | 'itemsPerPage'>> &
  Omit<PaginationControlProps, 'totalCount' | 'itemsPerPage'>

interface UsePaginationResult {
  /** Current page number — pass to API query as `page` */
  currentPage: number
  /** Items per page — pass to API query as `per` */
  itemsPerPage: PaginationItemsPerPage
  /** Build PaginationControlProps from API response headers */
  getPaginationProps: (headers: Headers, isFetching?: boolean) => PaginationProps
}

export function usePagination(options?: UsePaginationOptions): UsePaginationResult {
  const { defaultItemsPerPage = 5 } = options ?? {}
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(defaultItemsPerPage)

  const getPaginationProps = (headers: Headers, isFetching?: boolean): PaginationProps => {
    const totalPages = Number(headers.get('x-total-pages') ?? 1)
    const totalCount = Number(headers.get('x-total-count') ?? 0)

    return {
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage,
      isFetching,
      handleFirstPage: () => {
        setCurrentPage(1)
      },
      handleLastPage: () => {
        setCurrentPage(totalPages)
      },
      handleNextPage: () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages))
      },
      handlePreviousPage: () => {
        setCurrentPage(prev => Math.max(prev - 1, 1))
      },
      handleItemsPerPageChange: setItemsPerPage,
    }
  }

  return {
    currentPage,
    itemsPerPage,
    getPaginationProps,
  }
}
