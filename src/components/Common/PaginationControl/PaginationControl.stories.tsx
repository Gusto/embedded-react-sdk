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

export const FirstPage: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
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

export const LastPage: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
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

export const MiddlePage: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
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

export const EmptyState: Story = () => {
  return (
    <div>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        When totalItems is 0, pagination is hidden:
      </p>
      <div style={{ border: '1px dashed #ccc', padding: '1rem', minHeight: '50px' }}>
        <PaginationControl
          currentPage={1}
          totalPages={1}
          totalItems={0}
          itemsPerPage={5}
          handleFirstPage={() => {}}
          handlePreviousPage={() => {}}
          handleNextPage={() => {}}
          handleLastPage={() => {}}
          handleItemsPerPageChange={() => {}}
        />
        <p style={{ color: '#999', fontStyle: 'italic' }}>
          (Pagination control is not rendered - this is expected)
        </p>
      </div>
    </div>
  )
}

export const SinglePageWithItems: Story = () => {
  const { value: perPage, handleChange: setItemsPerPage } = useLadleState<number>(
    'SinglePageItemsPerPage',
    50,
  )
  const itemsPerPage = (perPage ?? 50) as 5 | 10 | 50

  return (
    <div>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        3 items with page size {itemsPerPage} = 1 page. Pagination is still visible so users can
        adjust page size:
      </p>
      <PaginationControl
        currentPage={1}
        totalPages={1}
        totalItems={3}
        itemsPerPage={itemsPerPage}
        handleFirstPage={() => {}}
        handlePreviousPage={() => {}}
        handleNextPage={() => {}}
        handleLastPage={() => {}}
        handleItemsPerPageChange={n => setItemsPerPage(n)}
      />
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Notice: All navigation buttons are disabled, but page size selector is available.
      </p>
    </div>
  )
}

export const LegacyWithoutTotalItems: Story = () => {
  const { value: page, handleChange: setCurrentPage } = useLadleState<number>(
    'LegacyPaginationPage',
    1,
  )
  const currentPage = page ?? 1
  const totalPages = 5

  return (
    <div>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Legacy usage without totalItems prop (fallback behavior - always shows):
      </p>
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={10}
        handleFirstPage={() => setCurrentPage(1)}
        handlePreviousPage={() => setCurrentPage(Math.max(1, currentPage - 1))}
        handleNextPage={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        handleLastPage={() => setCurrentPage(totalPages)}
        handleItemsPerPageChange={() => setCurrentPage(1)}
      />
    </div>
  )
}
