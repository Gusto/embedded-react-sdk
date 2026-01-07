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

export function extractPaginationMeta(httpMeta?: HttpMeta | null) {
  return {
    totalPages: Number(httpMeta?.response.headers.get('x-total-pages') ?? 1),
    totalItems: Number(httpMeta?.response.headers.get('x-total-count') ?? 0),
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
