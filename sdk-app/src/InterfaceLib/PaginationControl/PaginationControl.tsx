import { useId } from 'react'
import type { PaginationControlProps } from '@gusto/embedded-react-sdk'
import { ButtonIcon } from '../Button/ButtonIcon'
import { PaginationSizeSelect } from './PaginationSizeSelect'
import styles from './PaginationControl.module.scss'

type ItemsPerPage = 5 | 10 | 50

const ITEMS_PER_PAGE_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '50', label: '50' },
]

function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12.2074 5.20654L6.41445 10.9995H20.0004V12.9995H6.41445L12.2074 18.7925L10.7934 20.2065L3.29336 12.7065C2.90288 12.316 2.90285 11.683 3.29336 11.2925L10.7934 3.79248L12.2074 5.20654Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.7075 11.2925C20.8949 11.4799 21.0004 11.7345 21.0005 11.9995C21.0005 12.2645 20.8948 12.519 20.7075 12.7065L13.2075 20.2065L11.7935 18.7925L17.5864 12.9995H4.00049V10.9995H17.5864L11.7935 5.20654L13.2075 3.79248L20.7075 11.2925Z"
        fill="currentColor"
      />
    </svg>
  )
}

const MINIMUM_PAGE_SIZE = 5

export function PaginationControl({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage = 5,
  handlePreviousPage,
  handleNextPage,
  handleItemsPerPageChange,
}: PaginationControlProps) {
  const selectId = useId()

  if (totalCount !== undefined && totalCount <= MINIMUM_PAGE_SIZE) {
    return null
  }

  const onFirst = currentPage === 1
  const onLast = currentPage === totalPages

  return (
    <div className={styles.root} data-testid="pagination-control">
      <PaginationSizeSelect
        id={selectId}
        label="Results per page"
        value={itemsPerPage.toString()}
        onChange={n => {
          handleItemsPerPageChange(Number(n) as ItemsPerPage)
        }}
        options={ITEMS_PER_PAGE_OPTIONS}
      />
      <div className={styles.buttons}>
        <ButtonIcon
          aria-label="Previous page"
          isDisabled={onFirst}
          onClick={handlePreviousPage}
          className={styles.navButton}
        >
          <ArrowLeft />
        </ButtonIcon>
        <ButtonIcon
          aria-label="Next page"
          isDisabled={onLast}
          onClick={handleNextPage}
          className={styles.navButton}
        >
          <ArrowRight />
        </ButtonIcon>
      </div>
    </div>
  )
}
