import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockResizeObserver } from 'jsdom-testing-mocks'
import { userEvent } from '@testing-library/user-event'
import { DataView } from './DataView'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import type { DataViewProps } from '@/components/Common/DataView/DataView'
import { mockUseContainerBreakpoints } from '@/test/setup'

// Mock Data Type
type MockData = {
  id: number
  name: string
  age: number
}

// Sample Data
const testData: MockData[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
]

// Sample Columns
const testColumns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
] as const

// Mock Pagination
const mockPagination: PaginationControlProps = {
  currentPage: 2,
  totalPages: 3,
  handleFirstPage: vi.fn(),
  handlePreviousPage: vi.fn(),
  handleNextPage: vi.fn(),
  handleLastPage: vi.fn(),
  handleItemsPerPageChange: vi.fn(),
}

const resizeObserver = mockResizeObserver()

beforeEach(() => {
  // Configure the mock to return desktop breakpoints by default for these tests
  mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
})

// Create a function to render DataView components with necessary providers
const renderDataView = <T,>(props: DataViewProps<T>) => {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <DataView {...props} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('DataView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render the component', () => {
    renderDataView({ data: [], columns: [], label: 'Test View' })
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  test('should render data and columns', async () => {
    renderDataView({ data: testData, columns: [...testColumns], label: 'Test View' })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 650, blockSize: 600 },
    })
    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Age')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  test('should render DataTable when width is beyond breakpoint', async () => {
    renderDataView({ data: testData, columns: [...testColumns], label: 'Test View' })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 650, blockSize: 600 },
    })
    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  test('should render DataCards when width is less than breakpoint', async () => {
    // Configure mock to return mobile breakpoints for this test
    mockUseContainerBreakpoints.mockReturnValue(['base'])

    renderDataView({ data: testData, columns: [...testColumns], label: 'Test View' })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 300, blockSize: 600 },
    })
    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument()
    })
  })

  test('should render pagination controls', () => {
    renderDataView({
      data: testData,
      columns: [...testColumns],
      pagination: mockPagination,
      label: 'Test View',
    })

    expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
  })

  test('should call onSelect when a checkbox is clicked', async () => {
    const onSelectMock = vi.fn()
    renderDataView({
      data: testData,
      columns: [...testColumns],
      onSelect: onSelectMock,
      label: 'Test View',
    })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)

    await userEvent.click(checkboxes[0] as Element)
    expect(onSelectMock).toHaveBeenLastCalledWith(testData[0], true)

    await userEvent.click(checkboxes[0] as Element)
    expect(onSelectMock).toHaveBeenLastCalledWith(testData[0], false)
  })

  test('should render itemMenu when provided', () => {
    const itemMenuMock = vi.fn((item: MockData) => <div>Menu for {item.name}</div>)

    renderDataView({
      data: testData,
      columns: [...testColumns],
      itemMenu: itemMenuMock,
      label: 'Test View',
    })

    expect(screen.getByText('Menu for Alice')).toBeInTheDocument()
    expect(screen.getByText('Menu for Bob')).toBeInTheDocument()
  })

  test('should be able to navigate pagination forward', async () => {
    renderDataView({
      data: testData,
      columns: [...testColumns],
      pagination: mockPagination,
      label: 'Test View',
    })

    const nextButton = screen.getByTestId('pagination-next')
    await userEvent.click(nextButton)

    expect(mockPagination.handleNextPage).toHaveBeenCalledTimes(1)
  })

  test('should be able to navigate pagination backwards', async () => {
    renderDataView({
      data: testData,
      columns: [...testColumns],
      pagination: mockPagination,
      label: 'Test View',
    })

    const prevButton = screen.getByTestId('pagination-previous')
    await userEvent.click(prevButton)
    expect(mockPagination.handlePreviousPage).toHaveBeenCalledTimes(1)
  })

  test('should accept custom breakpoints', async () => {
    const customBreakpoints = {
      base: '0rem',
      small: '30rem', // Custom smaller breakpoint
      medium: '50rem',
      large: '70rem',
    }

    renderDataView({
      data: testData,
      columns: [...testColumns],
      label: 'Test View',
      breakAt: 'small',
      breakpoints: customBreakpoints,
    })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 450, blockSize: 600 }, // 28.125rem - below custom small breakpoint
    })
    act(() => {
      resizeObserver.resize()
    })

    // Verify the hook was called with custom breakpoints
    await waitFor(() => {
      expect(mockUseContainerBreakpoints).toHaveBeenCalledWith({
        ref: expect.any(Object),
        breakpoints: customBreakpoints,
      })
    })
  })

  test('should render empty state in DataTable', async () => {
    const emptyState = () => <div>No data available</div>

    renderDataView({
      data: [],
      columns: [...testColumns],
      label: 'Test View',
      emptyState,
    })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 650, blockSize: 600 },
    })
    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  test('should render empty state in DataCards', async () => {
    // Configure mock to return mobile breakpoints for this test
    mockUseContainerBreakpoints.mockReturnValue(['base'])

    const emptyState = () => <div>No items found</div>

    renderDataView({
      data: [],
      columns: [...testColumns],
      label: 'Test View',
      emptyState,
    })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 300, blockSize: 600 },
    })
    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByRole('listitem')).toBeInTheDocument()
      expect(screen.getByText('No items found')).toBeInTheDocument()
    })
  })

  test('should not render empty state when emptyState prop is not provided', async () => {
    renderDataView({
      data: [],
      columns: [...testColumns],
      label: 'Test View',
    })

    const dataViewContainer = screen.getByTestId('data-view')
    resizeObserver.mockElementSize(dataViewContainer, {
      contentBoxSize: { inlineSize: 650, blockSize: 600 },
    })
    act(() => {
      resizeObserver.resize()
    })

    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Age')).toBeInTheDocument()
    })
  })
})
