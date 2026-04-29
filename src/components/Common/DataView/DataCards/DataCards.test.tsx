import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataCards } from '@/components/Common/DataView/DataCards/DataCards'
import type { DataCardsProps } from '@/components/Common/DataView/DataCards/DataCards'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

type MockData = { id: number; name: string; age: number }

const testData: MockData[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
]

const testColumns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
] as const

const baseProps: DataCardsProps<MockData> = {
  data: testData,
  columns: [...testColumns],
  label: 'Test Cards',
}

const selectableProps: DataCardsProps<MockData> = {
  ...baseProps,
  onSelect: vi.fn(),
  getIsItemSelected: () => false,
  selectionMode: 'multiple',
}

const renderCards = (overrides: Partial<DataCardsProps<MockData>> = {}) =>
  renderWithProviders(<DataCards {...baseProps} {...overrides} />)

describe('DataCards', () => {
  test('should render the component', () => {
    renderCards({ data: [], columns: [] })
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  test('should render the component with data', () => {
    renderCards()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('should render the component with column headers', () => {
    renderCards()
    expect(screen.getAllByText('Name').length).toBe(testData.length)
    expect(screen.getAllByText('Age').length).toBe(testData.length)
  })

  test('should render the component with custom rendering', () => {
    renderCards({
      columns: [
        { key: 'name', title: 'Custom Name', render: (item: MockData) => `Hello, ${item.name}!` },
      ],
    })
    expect(screen.getAllByText('Custom Name').length).toBeGreaterThan(0)
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
    expect(screen.getByText('Hello, Bob!')).toBeInTheDocument()
  })

  test('should call onSelect when an item is clicked', async () => {
    const onSelectMock = vi.fn()
    renderCards({ ...selectableProps, onSelect: onSelectMock })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(testData.length + 1)

    await userEvent.click(checkboxes[1] as HTMLElement)
    expect(onSelectMock).toHaveBeenCalledWith(testData[0], true)
  })

  describe('select-all checkbox', () => {
    test('renders a select-all checkbox when selectionMode is multiple and onSelect is set', () => {
      renderCards(selectableProps)
      expect(screen.getAllByRole('checkbox')).toHaveLength(testData.length + 1)
      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument()
    })

    test('does not render select-all checkbox for single selectionMode', () => {
      renderCards({ onSelect: vi.fn(), selectionMode: 'single' })
      expect(screen.queryByLabelText('Select all rows')).not.toBeInTheDocument()
    })

    test('does not render select-all checkbox when no data', () => {
      renderCards({ ...selectableProps, data: [] })
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    test('select-all checkbox is checked when all rows selected', () => {
      renderCards({ ...selectableProps, getIsItemSelected: () => true })
      expect(screen.getByLabelText('Select all rows')).toBeChecked()
    })

    test('clicking select-all fires onSelectAll with true when not all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderCards({ ...selectableProps, onSelectAll: onSelectAllMock })
      await userEvent.click(screen.getAllByRole('checkbox')[0] as HTMLElement)
      expect(onSelectAllMock).toHaveBeenCalledWith(true, testData)
    })

    test('clicking select-all fires onSelectAll with false when all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderCards({
        ...selectableProps,
        onSelectAll: onSelectAllMock,
        getIsItemSelected: () => true,
      })
      await userEvent.click(screen.getAllByRole('checkbox')[0] as HTMLElement)
      expect(onSelectAllMock).toHaveBeenCalledWith(false, testData)
    })
  })

  test('should render empty state with proper accessibility structure when emptyState is provided', () => {
    renderCards({ data: [], columns: [], emptyState: () => <div>No data available</div> })
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  describe('isWithinBox', () => {
    test('renders without data-within-box attribute', () => {
      renderCards({ isWithinBox: true })
      expect(screen.getByTestId('data-cards')).not.toHaveAttribute('data-within-box')
    })

    test('applies withinBox class when isWithinBox is true', () => {
      renderCards({ isWithinBox: true })
      expect(screen.getByTestId('data-cards').className).toMatch(/withinBox/)
    })

    test('does not apply withinBox class by default', () => {
      renderCards()
      expect(screen.getByTestId('data-cards').className).not.toMatch(/withinBox/)
    })
  })

  test('should render footer when provided', () => {
    const footer = () => ({
      name: <strong>Total Records:</strong>,
      age: <strong>55</strong>,
    })
    renderCards({ footer })
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByText('Total Records:')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
  })
})
