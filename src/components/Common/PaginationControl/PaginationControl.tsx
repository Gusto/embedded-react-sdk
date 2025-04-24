import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from '../Flex/Flex'
import { Select } from '../UI/Select'
import style from './PaginationControl.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'
import PaginationFirstIcon from '@/assets/icons/pagination_first.svg?react'
import PaginationPrevIcon from '@/assets/icons/pagination_previous.svg?react'
import PaginationNextIcon from '@/assets/icons/pagination_next.svg?react'
import PaginationLastIcon from '@/assets/icons/pagination_last.svg?react'

export type PaginationControlProps = {
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (n: number) => void
  currentPage: number
  totalPages: number
}

export const PaginationControl = ({
  currentPage,
  totalPages,
  handleFirstPage,
  handlePreviousPage,
  handleNextPage,
  handleLastPage,
  handleItemsPerPageChange,
}: PaginationControlProps) => {
  const { t } = useTranslation('common')
  const Components = useComponentContext()
  const [pageSize, setPageSize] = useState('5')

  if (totalPages < 2) {
    return null
  }
  return (
    <section className={style.paginationControl} data-testid="pagination-control">
      <Flex justifyContent="space-between" alignItems="center">
        <div className={style.paginationControlCount}>
          <section>
            <Select
              label={t('labels.paginationControllCountLabel')}
              shouldVisuallyHideLabel
              value={pageSize}
              onChange={n => {
                setPageSize(n)
                handleItemsPerPageChange(Number(n))
              }}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '50', label: '50' },
              ]}
            />
          </section>
        </div>
        <div className={style.paginationControlButtons}>
          <Components.Button
            variant="icon"
            aria-label={t('icons.paginationFirst')}
            isDisabled={currentPage === 1}
            onClick={handleFirstPage}
          >
            <PaginationFirstIcon />
          </Components.Button>
          <Components.Button
            variant="icon"
            aria-label={t('icons.paginationPrev')}
            data-testid="pagination-previous"
            isDisabled={currentPage === 1}
            onClick={handlePreviousPage}
          >
            <PaginationPrevIcon />
          </Components.Button>
          <Components.Button
            variant="icon"
            aria-label={t('icons.paginationNext')}
            data-testid="pagination-next"
            isDisabled={currentPage === totalPages}
            onClick={handleNextPage}
          >
            <PaginationNextIcon />
          </Components.Button>
          <Components.Button
            variant="icon"
            aria-label={t('icons.paginationLast')}
            isDisabled={currentPage === totalPages}
            onClick={handleLastPage}
          >
            <PaginationLastIcon />
          </Components.Button>
        </div>
      </Flex>
    </section>
  )
}
