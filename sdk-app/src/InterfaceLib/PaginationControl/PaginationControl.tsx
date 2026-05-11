import type { PaginationControlProps, PaginationItemsPerPage } from '@gusto/embedded-react-sdk'
import styles from './PaginationControl.module.scss'

const PAGE_SIZES: PaginationItemsPerPage[] = [5, 10, 50]

export function PaginationControl({
  handleFirstPage,
  handlePreviousPage,
  handleNextPage,
  handleLastPage,
  handleItemsPerPageChange,
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  isFetching = false,
}: PaginationControlProps) {
  const isFirst = currentPage <= 1
  const isLast = currentPage >= totalPages

  return (
    <div className={styles.root} aria-busy={isFetching}>
      <div className={styles.info}>
        Page {currentPage} of {totalPages}
        {typeof totalCount === 'number' && <> · {totalCount} total</>}
      </div>
      <div className={styles.controls}>
        <label className={styles.pageSize}>
          <span className={styles.pageSizeLabel}>Per page</span>
          <select
            value={itemsPerPage ?? 10}
            onChange={event => {
              handleItemsPerPageChange(Number(event.target.value) as PaginationItemsPerPage)
            }}
            className={styles.pageSizeSelect}
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleFirstPage}
          disabled={isFirst}
          aria-label="First page"
          className={styles.navButton}
        >
          «
        </button>
        <button
          type="button"
          onClick={handlePreviousPage}
          disabled={isFirst}
          aria-label="Previous page"
          className={styles.navButton}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={isLast}
          aria-label="Next page"
          className={styles.navButton}
        >
          ›
        </button>
        <button
          type="button"
          onClick={handleLastPage}
          disabled={isLast}
          aria-label="Last page"
          className={styles.navButton}
        >
          »
        </button>
      </div>
    </div>
  )
}
