import { useId } from 'react'
import type { PaginationControlProps } from '@gusto/embedded-react-sdk'
import { ButtonIcon } from '../Button/ButtonIcon'
import { Select } from '../Select/Select'
import styles from './PaginationControl.module.scss'

type ItemsPerPage = 5 | 10 | 50

const ITEMS_PER_PAGE_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '50', label: '50' },
]

function ChevronFirst() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0246 4.02459C14.3907 4.3907 14.3907 4.9843 14.0246 5.35041L9.37502 10L14.0246 14.6496C14.3907 15.0157 14.3907 15.6093 14.0246 15.9754C13.6585 16.3415 13.0649 16.3415 12.6988 15.9754L7.60721 10.8839C7.11906 10.3957 7.11906 9.60427 7.60721 9.11612L12.6988 4.02459C13.0649 3.65847 13.6585 3.65847 14.0246 4.02459Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.625 4.0625C6.14277 4.0625 6.5625 4.48223 6.5625 5V15C6.5625 15.5178 6.14277 15.9375 5.625 15.9375C5.10723 15.9375 4.6875 15.5178 4.6875 15V5C4.6875 4.48223 5.10723 4.0625 5.625 4.0625Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0246 4.02459C13.3907 4.3907 13.3907 4.9843 13.0246 5.35041L8.37502 10L13.0246 14.6496C13.3907 15.0157 13.3907 15.6093 13.0246 15.9754C12.6585 16.3415 12.0649 16.3415 11.6988 15.9754L6.60721 10.8839C6.11906 10.3957 6.11906 9.60427 6.60721 9.11612L11.6988 4.02459C12.0649 3.65847 12.6585 3.65847 13.0246 4.02459Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.97539 4.02459C6.60927 4.3907 6.60927 4.9843 6.97539 5.35041L11.625 10L6.97539 14.6496C6.60927 15.0157 6.60927 15.6093 6.97539 15.9754C7.3415 16.3415 7.93511 16.3415 8.30122 15.9754L13.3928 10.8839C13.8809 10.3957 13.8809 9.60427 13.3928 9.11612L8.30122 4.02459C7.93511 3.65847 7.3415 3.65847 6.97539 4.02459Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ChevronLast() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.97539 4.02459C5.60927 4.3907 5.60927 4.9843 5.97539 5.35041L10.625 10L5.97539 14.6496C5.60927 15.0157 5.60927 15.6093 5.97539 15.9754C6.3415 16.3415 6.93511 16.3415 7.30122 15.9754L12.3928 10.8839C12.8809 10.3957 12.8809 9.60427 12.3928 9.11612L7.30122 4.02459C6.93511 3.65847 6.3415 3.65847 5.97539 4.02459Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.375 4.0625C14.8928 4.0625 15.3125 4.48223 15.3125 5V15C15.3125 15.5178 14.8928 15.9375 14.375 15.9375C13.8572 15.9375 13.4375 15.5178 13.4375 15V5C13.4375 4.48223 13.8572 4.0625 14.375 4.0625Z"
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
  isFetching,
  handleFirstPage,
  handlePreviousPage,
  handleNextPage,
  handleLastPage,
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
      <div className={styles.itemsPerPage}>
        <label htmlFor={selectId}>Rows per page</label>
        <div className={styles.selectWrapper}>
          <Select
            id={selectId}
            label="Rows per page"
            shouldVisuallyHideLabel
            value={itemsPerPage.toString()}
            onChange={n => {
              handleItemsPerPageChange(Number(n) as ItemsPerPage)
            }}
            options={ITEMS_PER_PAGE_OPTIONS}
          />
        </div>
      </div>
      <div className={styles.buttons}>
        <span className={styles.pageIndicator}>
          Page {currentPage} of {totalPages}
          {isFetching ? ' …' : ''}
        </span>
        <ButtonIcon aria-label="First page" isDisabled={onFirst} onClick={handleFirstPage}>
          <ChevronFirst />
        </ButtonIcon>
        <ButtonIcon aria-label="Previous page" isDisabled={onFirst} onClick={handlePreviousPage}>
          <ChevronLeft />
        </ButtonIcon>
        <ButtonIcon aria-label="Next page" isDisabled={onLast} onClick={handleNextPage}>
          <ChevronRight />
        </ButtonIcon>
        <ButtonIcon aria-label="Last page" isDisabled={onLast} onClick={handleLastPage}>
          <ChevronLast />
        </ButtonIcon>
      </div>
    </div>
  )
}
