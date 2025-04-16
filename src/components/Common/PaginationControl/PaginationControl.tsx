import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Flex } from '../Flex/Flex'
import { SelectField } from '../Fields/SelectField/SelectField'
import { Button } from '../Button/Button'
import style from './PaginationControl.module.scss'
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
  useForm({
    defaultValues: { pageSize: 5 },
  })
  if (totalPages < 2) {
    return null
  }
  return (
    <section className={style.paginationControl} data-testid="pagination-control">
      <Flex justifyContent="space-between" alignItems="center">
        <div className={style.paginationControlCount}>
          <section>
            <SelectField
              name="pageSize"
              label={t('labels.paginationControllCountLabel')}
              shouldVisuallyHideLabel
              defaultValue="5"
              onChange={n => {
                handleItemsPerPageChange(Number(n))
              }}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '50', label: '50' },
              ]}
            />
          </section>
          <label aria-hidden>{t('labels.paginationControllCountLabel')}</label>
        </div>
        <div className={style.paginationControlButtons}>
          <Button
            variant="icon"
            aria-label={t('icons.paginationFirst')}
            isDisabled={currentPage === 1}
            onPress={handleFirstPage}
          >
            <PaginationFirstIcon />
          </Button>
          <Button
            variant="icon"
            aria-label={t('icons.paginationPrev')}
            data-testid="pagination-previous"
            isDisabled={currentPage === 1}
            onPress={handlePreviousPage}
          >
            <PaginationPrevIcon />
          </Button>
          <Button
            variant="icon"
            aria-label={t('icons.paginationNext')}
            data-testid="pagination-next"
            isDisabled={currentPage === totalPages}
            onPress={handleNextPage}
          >
            <PaginationNextIcon />
          </Button>
          <Button
            variant="icon"
            aria-label={t('icons.paginationLast')}
            isDisabled={currentPage === totalPages}
            onPress={handleLastPage}
          >
            <PaginationLastIcon />
          </Button>
        </div>
      </Flex>
    </section>
  )
}
