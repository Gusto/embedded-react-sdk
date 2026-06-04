/** @public */
export type PaginationItemsPerPage = 5 | 10 | 25 | 50

/**
 * Props your `PaginationControl` implementation must accept from the component adapter.
 * Renders pagination controls for navigating between pages of results.
 *
 * @public
 */
export type PaginationControlProps = {
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (n: PaginationItemsPerPage) => void
  currentPage: number
  totalPages: number
  totalCount?: number
  itemsPerPage?: PaginationItemsPerPage
  isFetching?: boolean
}
