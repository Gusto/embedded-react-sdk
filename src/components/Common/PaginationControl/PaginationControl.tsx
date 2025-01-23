import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Common'
import PaginationFirstIcon from '@/assets/icons/pagination_first.svg?react'
import PaginationPrevIcon from '@/assets/icons/pagination_previous.svg?react'
import PaginationNextIcon from '@/assets/icons/pagination_next.svg?react'
import PaginationLastIcon from '@/assets/icons/pagination_last.svg?react'

type PaginationControlProps = {
    handleFirstPage: () => void
    handlePreviousPage: () => void
    handleNextPage: () => void
    handleLastPage: () => void
    currentPage: number
    totalPages: number
}

export const PaginationControl = ({
    currentPage,
    totalPages,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage
}: PaginationControlProps) => {
    const { t } = useTranslation('common')
    console.log(totalPages, currentPage)
    return (
        <section>
            <Button
                variant="icon"
                aria-label={t('icons.paginationFirst')}
                isDisabled={currentPage === 1}
                onPress={handleFirstPage}
            >
                <PaginationFirstIcon />
            </Button>
            <Button variant="icon" aria-label={t('icons.paginationPrev')} isDisabled={currentPage === 1} onPress={handlePreviousPage}>
                <PaginationPrevIcon />
            </Button>
            <Button variant="icon" aria-label={t('icons.paginationNext')} isDisabled={currentPage === totalPages} onPress={handleNextPage}>
                <PaginationNextIcon />
            </Button>
            <Button variant="icon" aria-label={t('icons.paginationLast')} isDisabled={currentPage === totalPages} onPress={handleLastPage}>
                <PaginationLastIcon />
            </Button>
        </section>
    )
}
