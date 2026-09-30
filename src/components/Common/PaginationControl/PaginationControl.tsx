import { useTranslation } from 'react-i18next'
import { Flex } from '../Flex/Flex'
import { InlineSpinner } from '../InlineSpinner'
import style from './PaginationControl.module.scss'
import type { PaginationControlProps, PaginationItemsPerPage } from './PaginationControlTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PaginationFirstIcon from '@/assets/icons/pagination_first.svg?react'
import PaginationPrevIcon from '@/assets/icons/pagination_previous.svg?react'
import PaginationNextIcon from '@/assets/icons/pagination_next.svg?react'
import PaginationLastIcon from '@/assets/icons/pagination_last.svg?react'

const MINIMUM_PAGE_SIZE = 5

const ITEMS_PER_PAGE_OPTIONS: PaginationItemsPerPage[] = [5, 10, 25, 50]

const shouldShowPagination = (totalCount: number | undefined): boolean => {
  if (totalCount === undefined) return true
  if (totalCount === 0) return false
  return totalCount > MINIMUM_PAGE_SIZE
}

const getVisibleItemsPerPageOptions = (
  totalCount: number | undefined,
  itemsPerPage: PaginationItemsPerPage,
): PaginationItemsPerPage[] => {
  if (totalCount === undefined) return ITEMS_PER_PAGE_OPTIONS

  const smallestOptionCoveringAll = ITEMS_PER_PAGE_OPTIONS.find(option => option >= totalCount)
  const visible = new Set<PaginationItemsPerPage>(
    ITEMS_PER_PAGE_OPTIONS.filter(option => option < totalCount),
  )
  visible.add(itemsPerPage)
  if (smallestOptionCoveringAll !== undefined) visible.add(smallestOptionCoveringAll)

  return ITEMS_PER_PAGE_OPTIONS.filter(option => visible.has(option))
}

const DefaultPaginationControl = ({
  currentPage,
  totalPages,
  totalCount,
  isFetching,
  handleFirstPage,
  handlePreviousPage,
  handleNextPage,
  handleLastPage,
  handleItemsPerPageChange,
  itemsPerPage = 5,
}: PaginationControlProps) => {
  const { t } = useTranslation('common')
  const Components = useComponentContext()

  if (!shouldShowPagination(totalCount)) {
    return null
  }

  return (
    <section className={style.paginationControl} data-testid="pagination-control">
      <Flex justifyContent="space-between" alignItems="center">
        <div className={style.paginationControlCount}>
          <section>
            <Components.Select
              label={t('labels.paginationControlCountLabel')}
              placeholder=""
              shouldVisuallyHideLabel
              value={itemsPerPage.toString()}
              onChange={n => {
                handleItemsPerPageChange(Number(n) as PaginationItemsPerPage)
              }}
              options={getVisibleItemsPerPageOptions(totalCount, itemsPerPage).map(option => ({
                value: option.toString(),
                label: option.toString(),
              }))}
            />
          </section>
        </div>
        <div className={style.paginationControlButtons}>
          {isFetching && <InlineSpinner ariaLabel={t('labels.paginationFetchingLabel')} />}
          <Components.ButtonIcon
            aria-label={t('icons.paginationFirst')}
            isDisabled={currentPage === 1}
            onClick={handleFirstPage}
          >
            <PaginationFirstIcon />
          </Components.ButtonIcon>
          <Components.ButtonIcon
            aria-label={t('icons.paginationPrev')}
            data-testid="pagination-previous"
            isDisabled={currentPage === 1}
            onClick={handlePreviousPage}
          >
            <PaginationPrevIcon />
          </Components.ButtonIcon>
          <Components.ButtonIcon
            aria-label={t('icons.paginationNext')}
            data-testid="pagination-next"
            isDisabled={currentPage === totalPages}
            onClick={handleNextPage}
          >
            <PaginationNextIcon />
          </Components.ButtonIcon>
          <Components.ButtonIcon
            aria-label={t('icons.paginationLast')}
            isDisabled={currentPage === totalPages}
            onClick={handleLastPage}
          >
            <PaginationLastIcon />
          </Components.ButtonIcon>
        </div>
      </Flex>
    </section>
  )
}

/** @internal */
export const PaginationControl = (props: PaginationControlProps) => {
  const Components = useComponentContext()

  return Components.PaginationControl ? (
    <Components.PaginationControl {...props} />
  ) : (
    <DefaultPaginationControl {...props} />
  )
}
