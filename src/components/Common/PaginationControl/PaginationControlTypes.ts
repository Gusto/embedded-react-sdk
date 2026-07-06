/**
 * @public
 * @group Utility types
 */
export type PaginationItemsPerPage = 5 | 10 | 25 | 50

/**
 * Props your `PaginationControl` implementation must accept from the component adapter.
 * Renders pagination controls for navigating between pages of results.
 *
 * @public
 * @group Component props
 */
export interface PaginationControlProps {
  /** Navigate to the first page. */
  handleFirstPage: () => void
  /** Navigate to the previous page. */
  handlePreviousPage: () => void
  /** Navigate to the next page. */
  handleNextPage: () => void
  /** Navigate to the last page. */
  handleLastPage: () => void
  /** Called when the user changes the number of items displayed per page. */
  handleItemsPerPageChange: (n: PaginationItemsPerPage) => void
  /** The currently active page (1-based). */
  currentPage: number
  /** Total number of pages. */
  totalPages: number
  /** Total number of items across all pages. */
  totalCount?: number
  /** Number of items shown per page. */
  itemsPerPage?: PaginationItemsPerPage
  /** Whether a page fetch is in progress. */
  isFetching?: boolean
}
