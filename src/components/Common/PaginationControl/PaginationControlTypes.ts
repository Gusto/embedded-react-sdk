export type PaginationItemsPerPage = 5 | 10 | 50

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
