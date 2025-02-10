import { useTranslation } from 'react-i18next'
import { Button, Flex, Select } from '@/components/Common'
import PaginationFirstIcon from '@/assets/icons/pagination_first.svg?react'
import PaginationPrevIcon from '@/assets/icons/pagination_previous.svg?react'
import PaginationNextIcon from '@/assets/icons/pagination_next.svg?react'
import PaginationLastIcon from '@/assets/icons/pagination_last.svg?react'
import { useForm } from 'react-hook-form'
import { ListBoxItem } from 'react-aria-components'
import style from './PaginationControl.module.scss'

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
  const { control } = useForm({
    defaultValues: { pageSize: 5 },
  })
  return (
    <section className={style.paginationControl} data-testid="pagination-control">
      <Flex justifyContent="space-between" alignItems="center">
        <div className={style.paginationControlCount}>
          <section>
            <Select
              control={control}
              aria-label={t('labels.paginationControllCountLabel')}
              name="pageSize"
              onSelectionChange={n => {
                handleItemsPerPageChange(Number(n))
              }}
              defaultSelectedKey={'5'}
              items={[{ id: 5 }, { id: 10 }, { id: 50 }]}
            >
              {option => <ListBoxItem>{option.id}</ListBoxItem>}
            </Select>
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
