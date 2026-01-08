import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { PaginationControl } from './PaginationControl'
import type { PaginationControlProps } from './PaginationControlTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

const basePaginationProps: PaginationControlProps = {
  currentPage: 1,
  totalPages: 3,
  itemsPerPage: 5,
  handleFirstPage: vi.fn(),
  handlePreviousPage: vi.fn(),
  handleNextPage: vi.fn(),
  handleLastPage: vi.fn(),
  handleItemsPerPageChange: vi.fn(),
}

const renderPaginationControl = (props: Partial<PaginationControlProps> = {}) => {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <PaginationControl {...basePaginationProps} {...props} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('PaginationControl Visibility', () => {
  describe('based on totalCount', () => {
    test('hides when totalCount is 0 (empty state)', () => {
      renderPaginationControl({ totalCount: 0 })
      expect(screen.queryByTestId('pagination-control')).not.toBeInTheDocument()
    })

    test('hides when totalCount <= MINIMUM_PAGE_SIZE (5)', () => {
      renderPaginationControl({ totalCount: 5 })
      expect(screen.queryByTestId('pagination-control')).not.toBeInTheDocument()
    })

    test('hides when totalCount is 3 (less than min page size)', () => {
      renderPaginationControl({ totalCount: 3 })
      expect(screen.queryByTestId('pagination-control')).not.toBeInTheDocument()
    })

    test('shows when totalCount > MINIMUM_PAGE_SIZE', () => {
      renderPaginationControl({ totalCount: 6 })
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })

    test('shows when totalCount is undefined (server info unavailable)', () => {
      renderPaginationControl({ totalCount: undefined })
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })

    test('shows when totalCount is large', () => {
      renderPaginationControl({ totalCount: 100 })
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    test('shows pagination when totalCount > 5 even with totalPages = 1', () => {
      renderPaginationControl({ totalCount: 10, totalPages: 1, itemsPerPage: 50 })
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })

    test('hides when totalCount is exactly 5', () => {
      renderPaginationControl({ totalCount: 5, totalPages: 1 })
      expect(screen.queryByTestId('pagination-control')).not.toBeInTheDocument()
    })
  })
})
