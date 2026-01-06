import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { PaginationControl } from './PaginationControl'
import type { PaginationControlProps } from './PaginationControlTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

const createMockPaginationProps = (
  overrides: Partial<PaginationControlProps> = {},
): PaginationControlProps => ({
  currentPage: 1,
  totalPages: 5,
  totalItems: 25,
  itemsPerPage: 5,
  handleFirstPage: vi.fn(),
  handlePreviousPage: vi.fn(),
  handleNextPage: vi.fn(),
  handleLastPage: vi.fn(),
  handleItemsPerPageChange: vi.fn(),
  ...overrides,
})

const renderPaginationControl = (props: PaginationControlProps) => {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <PaginationControl {...props} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('PaginationControl', () => {
  describe('visibility logic', () => {
    test('hides when totalItems is 0 (empty state)', () => {
      const props = createMockPaginationProps({ totalItems: 0 })
      const { container } = renderPaginationControl(props)
      expect(container.querySelector('[data-testid="pagination-control"]')).not.toBeInTheDocument()
    })

    test('shows when totalItems > 0 and totalPages === 1 (single page with items)', () => {
      const props = createMockPaginationProps({ totalItems: 3, totalPages: 1 })
      renderPaginationControl(props)
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })

    test('shows when totalItems is undefined (fallback for legacy usage)', () => {
      const props = createMockPaginationProps({ totalItems: undefined, totalPages: 2 })
      renderPaginationControl(props)
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })

    test('shows when totalItems > 0 and totalPages > 1 (multi-page)', () => {
      const props = createMockPaginationProps({ totalItems: 50, totalPages: 5 })
      renderPaginationControl(props)
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })
  })

  describe('button disabled states', () => {
    test('first and previous buttons are disabled when currentPage === 1', () => {
      const props = createMockPaginationProps({ currentPage: 1, totalPages: 5 })
      renderPaginationControl(props)

      const firstButton = screen.getByRole('button', { name: /paginationFirst/i })
      const previousButton = screen.getByTestId('pagination-previous')

      expect(firstButton).toBeDisabled()
      expect(previousButton).toBeDisabled()
    })

    test('next and last buttons are disabled when currentPage === totalPages', () => {
      const props = createMockPaginationProps({ currentPage: 5, totalPages: 5 })
      renderPaginationControl(props)

      const nextButton = screen.getByTestId('pagination-next')
      const lastButton = screen.getByRole('button', { name: /paginationLast/i })

      expect(nextButton).toBeDisabled()
      expect(lastButton).toBeDisabled()
    })

    test('all nav buttons are disabled when totalPages === 1', () => {
      const props = createMockPaginationProps({
        currentPage: 1,
        totalPages: 1,
        totalItems: 3,
      })
      renderPaginationControl(props)

      const firstButton = screen.getByRole('button', { name: /paginationFirst/i })
      const previousButton = screen.getByTestId('pagination-previous')
      const nextButton = screen.getByTestId('pagination-next')
      const lastButton = screen.getByRole('button', { name: /paginationLast/i })

      expect(firstButton).toBeDisabled()
      expect(previousButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
      expect(lastButton).toBeDisabled()
    })
  })

  describe('page size selector', () => {
    test('is visible when pagination is shown', () => {
      const props = createMockPaginationProps({ totalItems: 25 })
      renderPaginationControl(props)

      const selectButton = screen.getByRole('button', { name: /paginationControlCountLabel/i })
      expect(selectButton).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('all nav buttons have aria-labels', () => {
      const props = createMockPaginationProps()
      renderPaginationControl(props)

      expect(screen.getByRole('button', { name: /paginationFirst/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /paginationPrev/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /paginationNext/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /paginationLast/i })).toBeInTheDocument()
    })

    test('select button has an accessible label', () => {
      const props = createMockPaginationProps()
      renderPaginationControl(props)

      const selectButton = screen.getByRole('button', { name: /paginationControlCountLabel/i })
      expect(selectButton).toHaveAttribute('aria-label')
    })
  })

  describe('navigation handlers', () => {
    test('handleNextPage is called when next button is clicked', async () => {
      const handleNextPage = vi.fn()
      const props = createMockPaginationProps({ currentPage: 2, handleNextPage })
      renderPaginationControl(props)

      await userEvent.click(screen.getByTestId('pagination-next'))
      expect(handleNextPage).toHaveBeenCalledTimes(1)
    })

    test('handlePreviousPage is called when previous button is clicked', async () => {
      const handlePreviousPage = vi.fn()
      const props = createMockPaginationProps({ currentPage: 2, handlePreviousPage })
      renderPaginationControl(props)

      await userEvent.click(screen.getByTestId('pagination-previous'))
      expect(handlePreviousPage).toHaveBeenCalledTimes(1)
    })

    test('handleFirstPage is called when first button is clicked', async () => {
      const handleFirstPage = vi.fn()
      const props = createMockPaginationProps({ currentPage: 3, handleFirstPage })
      renderPaginationControl(props)

      await userEvent.click(screen.getByRole('button', { name: /paginationFirst/i }))
      expect(handleFirstPage).toHaveBeenCalledTimes(1)
    })

    test('handleLastPage is called when last button is clicked', async () => {
      const handleLastPage = vi.fn()
      const props = createMockPaginationProps({ currentPage: 2, handleLastPage })
      renderPaginationControl(props)

      await userEvent.click(screen.getByRole('button', { name: /paginationLast/i }))
      expect(handleLastPage).toHaveBeenCalledTimes(1)
    })
  })
})
