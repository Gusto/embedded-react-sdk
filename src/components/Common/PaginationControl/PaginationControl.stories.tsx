import type { Story } from '@ladle/react'
import { useLadleState } from '../../../../.ladle/helpers/LadleState'
import { PaginationControl } from './PaginationControl'

export default {
  title: 'UI/Common/PaginationControl',
}

export const Default: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
    'PaginationCurrentPage',
    1,
  )
  const currentPage = page ?? 1
  const totalPages = 10

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      handleFirstPage={() => setCurrentPage(1)}
      handlePreviousPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
      handleNextPage={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      handleLastPage={() => setCurrentPage(totalPages)}
      handleItemsPerPageChange={n => {
        setCurrentPage(1)
      }}
    />
  )
}

export const FirstPage: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
    'PaginationFirstPage',
    1,
  )
  const currentPage = page ?? 1
  const totalPages = 10

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      handleFirstPage={() => setCurrentPage(1)}
      handlePreviousPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
      handleNextPage={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      handleLastPage={() => setCurrentPage(totalPages)}
      handleItemsPerPageChange={() => {
        setCurrentPage(1)
      }}
    />
  )
}

export const LastPage: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
    'PaginationLastPage',
    10,
  )
  const currentPage = page ?? 10
  const totalPages = 10

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      handleFirstPage={() => setCurrentPage(1)}
      handlePreviousPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
      handleNextPage={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      handleLastPage={() => setCurrentPage(totalPages)}
      handleItemsPerPageChange={() => {
        setCurrentPage(1)
      }}
    />
  )
}

export const MiddlePage: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
    'PaginationMiddlePage',
    5,
  )
  const currentPage = page ?? 5
  const totalPages = 10

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      handleFirstPage={() => setCurrentPage(1)}
      handlePreviousPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
      handleNextPage={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      handleLastPage={() => setCurrentPage(totalPages)}
      handleItemsPerPageChange={() => {
        setCurrentPage(1)
      }}
    />
  )
}
