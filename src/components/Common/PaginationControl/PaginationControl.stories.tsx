import { useStoryState } from '../../../../.storybook/helpers/useStoryState'
import { PaginationControl } from './PaginationControl'

export default {
  title: 'UI/Common/PaginationControl',
}

export const Default = () => {
  const { value: page, handleChange: setCurrentPage } = useStoryState<number>(
    'PaginationCurrentPage',
    1,
  )
  const currentPage = page ?? 1
  const totalPages = 10
  const itemsPerPage = 5

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
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

export const FirstPage = () => {
  const { value: page, handleChange: setCurrentPage } = useStoryState<number>(
    'PaginationFirstPage',
    1,
  )
  const currentPage = page ?? 1
  const totalPages = 10
  const itemsPerPage = 5

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
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

export const LastPage = () => {
  const { value: page, handleChange: setCurrentPage } = useStoryState<number>(
    'PaginationLastPage',
    10,
  )
  const currentPage = page ?? 10
  const totalPages = 10
  const itemsPerPage = 5

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
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

export const MiddlePage = () => {
  const { value: page, handleChange: setCurrentPage } = useStoryState<number>(
    'PaginationMiddlePage',
    5,
  )
  const currentPage = page ?? 5
  const totalPages = 10
  const itemsPerPage = 5

  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
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
