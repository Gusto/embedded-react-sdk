import { useCallback, useMemo } from 'react'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'

type HttpMeta = {
  response: Response
}

type PaginationState = {
  currentPage: number
  itemsPerPage: PaginationItemsPerPage
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  setItemsPerPage: React.Dispatch<React.SetStateAction<PaginationItemsPerPage>>
}

function parseHeaderInt(value: string | null, defaultValue: number): number {
  if (value === null) return defaultValue
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

export function extractPaginationMeta(httpMeta?: HttpMeta | null) {
  return {
    totalPages: parseHeaderInt(httpMeta?.response.headers.get('x-total-pages') ?? null, 1),
    totalItems: parseHeaderInt(httpMeta?.response.headers.get('x-total-count') ?? null, 0),
  }
}

export function usePagination(httpMeta: HttpMeta | undefined, state: PaginationState) {
  const { currentPage, itemsPerPage, setCurrentPage, setItemsPerPage } = state

  const { totalPages, totalItems } = extractPaginationMeta(httpMeta)

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [setCurrentPage])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }, [setCurrentPage])

  const handleNextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }, [setCurrentPage, totalPages])

  const handleLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [setCurrentPage, totalPages])

  const handleItemsPerPageChange = useCallback(
    (n: PaginationItemsPerPage) => {
      setItemsPerPage(n)
      setCurrentPage(1)
    },
    [setItemsPerPage, setCurrentPage],
  )

  return useMemo(
    () => ({
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      handleFirstPage,
      handlePreviousPage,
      handleNextPage,
      handleLastPage,
      handleItemsPerPageChange,
    }),
    [
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      handleFirstPage,
      handlePreviousPage,
      handleNextPage,
      handleLastPage,
      handleItemsPerPageChange,
    ],
  )
}
