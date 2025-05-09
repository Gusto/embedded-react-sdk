export type PaginationControlProps = {
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (n: number) => void
  currentPage: number
  totalPages: number
}
