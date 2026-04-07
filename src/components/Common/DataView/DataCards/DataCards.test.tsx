import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataCards } from '@/components/Common/DataView/DataCards/DataCards'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Mock data type
type MockData = {
  id: number
  name: string
  age: number
}

// Sample test data
const testData: MockData[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
]

// Sample columns
const testColumns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
] as const

describe('DataCards', () => {
  test('should render the component', () => {
    renderWithProviders(<DataCards data={[]} columns={[]} label="Test Cards" />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  test('should render the component with data', () => {
    renderWithProviders(<DataCards data={testData} columns={[...testColumns]} label="Test Cards" />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('should render the component with column headers', () => {
    renderWithProviders(<DataCards data={testData} columns={[...testColumns]} label="Test Cards" />)

    expect(screen.getAllByText('Name').length).toBe(testData.length)
    expect(screen.getAllByText('Age').length).toBe(testData.length)
  })

  test('should render the component with custom rendering', () => {
    renderWithProviders(
      <DataCards
        data={testData}
        label="Test Cards"
        columns={[
          {
            key: 'name',
            title: 'Custom Name',
            render: (item: MockData) => `Hello, ${item.name}!`,
          },
        ]}
      />,
    )

    expect(screen.getAllByText('Custom Name').length).toBeGreaterThan(0)
    expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
    expect(screen.getByText('Hello, Bob!')).toBeInTheDocument()
  })

  test('should call onSelect when an item is clicked', async () => {
    const onSelectMock = vi.fn()
    renderWithProviders(
      <DataCards
        data={testData}
        columns={[...testColumns]}
        label="Test Cards"
        onSelect={onSelectMock}
        isItemSelected={() => false}
      />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    // +1 for the select-all checkbox
    expect(checkboxes).toHaveLength(testData.length + 1)

    const firstRowCheckbox = checkboxes[1]
    await userEvent.click(firstRowCheckbox as HTMLElement)
    expect(onSelectMock).toHaveBeenCalledWith(testData[0], true, 0)
  })

  describe('select-all checkbox', () => {
    test('renders a select-all checkbox when selectionMode is multiple and onSelect is set', () => {
      renderWithProviders(
        <DataCards
          data={testData}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          isItemSelected={() => false}
          selectionMode="multiple"
        />,
      )

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(testData.length + 1)
      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument()
    })

    test('does not render select-all checkbox for single selectionMode', () => {
      renderWithProviders(
        <DataCards
          data={testData}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          selectionMode="single"
        />,
      )

      expect(screen.queryByLabelText('Select all rows')).not.toBeInTheDocument()
    })

    test('does not render select-all checkbox when no data', () => {
      renderWithProviders(
        <DataCards
          data={[]}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          selectionMode="multiple"
        />,
      )

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    test('select-all checkbox is checked when all rows selected', () => {
      renderWithProviders(
        <DataCards
          data={testData}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          isItemSelected={() => true}
          selectionMode="multiple"
        />,
      )

      const selectAllCheckbox = screen.getByLabelText('Select all rows')
      const selectAllWrapper = selectAllCheckbox.closest('[data-checked]')
      expect(selectAllWrapper).toHaveAttribute('data-checked', 'true')
    })

    test('select-all checkbox is indeterminate when some rows selected', () => {
      renderWithProviders(
        <DataCards
          data={testData}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          isItemSelected={(_item, index) => index === 0}
          selectionMode="multiple"
        />,
      )

      const selectAllCheckbox = screen.getByLabelText('Select all rows')
      const selectAllWrapper = selectAllCheckbox.closest('[data-checked]')
      expect(selectAllWrapper).toHaveAttribute('data-indeterminate', 'true')
    })

    test('clicking select-all fires onSelectAll with true when not all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderWithProviders(
        <DataCards
          data={testData}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          onSelectAll={onSelectAllMock}
          isItemSelected={() => false}
          selectionMode="multiple"
        />,
      )

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await userEvent.click(selectAllCheckbox as HTMLElement)
      expect(onSelectAllMock).toHaveBeenCalledWith(true, testData)
    })

    test('clicking select-all fires onSelectAll with false when all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderWithProviders(
        <DataCards
          data={testData}
          columns={[...testColumns]}
          label="Test Cards"
          onSelect={vi.fn()}
          onSelectAll={onSelectAllMock}
          isItemSelected={() => true}
          selectionMode="multiple"
        />,
      )

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await userEvent.click(selectAllCheckbox as HTMLElement)
      expect(onSelectAllMock).toHaveBeenCalledWith(false, testData)
    })
  })

  test('should render empty state with proper accessibility structure when emptyState is provided', () => {
    const emptyState = () => <div>No data available</div>
    renderWithProviders(
      <DataCards data={[]} columns={[]} label="Test Cards" emptyState={emptyState} />,
    )

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    // With empty data and emptyState function, there should be one listitem containing the empty state
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  test('should render footer when provided', () => {
    const footer = () => ({
      name: <strong>Total Records:</strong>,
      age: <strong>55</strong>, // Different from Alice's age (25) and Bob's age (30)
    })

    renderWithProviders(
      <DataCards data={testData} columns={[...testColumns]} label="Test Cards" footer={footer} />,
    )

    // Footer should render as an additional list item
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3) // 2 data items + 1 footer item

    expect(screen.getByText('Total Records:')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
  })
})
