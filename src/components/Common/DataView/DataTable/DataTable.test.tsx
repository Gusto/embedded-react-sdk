import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataTable } from '@/components/Common/DataView/DataTable/DataTable'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'

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
const testColumns: useDataViewPropReturn<MockData>['columns'] = [
  {
    key: 'name',
    title: 'Name',
    render: (item: MockData) => item.name,
  },
  {
    key: 'age',
    title: 'Age',
    render: (item: MockData) => item.age.toString(),
  },
]

// Create a function to render DataTable components with necessary providers
const renderTable = <T,>(props: React.ComponentProps<typeof DataTable<T>>) => {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <DataTable<T> {...props} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('DataTable Component', () => {
  test('should render the table structure', () => {
    renderTable<MockData>({ data: [], columns: [], label: 'Test Table' })

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
  })

  test('should render the table with data and columns', () => {
    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      label: 'Test Table',
    })

    expect(screen.getAllByRole('row')).toHaveLength(testData.length + 1) // +1 for header
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('should render checkboxes and call onSelect when clicked', async () => {
    const onSelectMock = vi.fn()
    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      onSelect: onSelectMock,
      label: 'Test Table',
    })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(testData.length)

    const firstCheckbox = checkboxes.at(0)
    expect(firstCheckbox).toBeDefined()

    if (firstCheckbox) {
      await userEvent.click(firstCheckbox)
      expect(onSelectMock).toHaveBeenCalledWith(testData[0], true)
    }
  })

  test('should render itemMenu when provided', () => {
    const itemMenuMock = vi.fn((item: MockData) => <div>Menu for {item.name}</div>)

    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      itemMenu: itemMenuMock,
      label: 'Test Table',
    })

    expect(screen.getByText('Menu for Alice')).toBeInTheDocument()
    expect(screen.getByText('Menu for Bob')).toBeInTheDocument()
  })

  test('should render footer when provided', () => {
    const footer = () => ({
      name: <strong>Total Records:</strong>,
      age: <strong>55</strong>, // Different from Alice's age (25) and Bob's age (30)
    })

    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      footer: footer,
      label: 'Test Table with Footer',
    })

    expect(screen.getByText('Total Records:')).toBeInTheDocument()
    expect(screen.getByText('55')).toBeInTheDocument()
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations - empty table', async () => {
      const { container } = renderTable<MockData>({ data: [], columns: [], label: 'Test Table' })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - data table with content', async () => {
      const { container } = renderTable<MockData>({
        data: testData,
        columns: testColumns,
        label: 'Test Table',
      })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - interactive table with checkboxes', async () => {
      const { container } = renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        label: 'Test Table',
      })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - table with custom menu content', async () => {
      const { container } = renderTable<MockData>({
        data: testData,
        columns: testColumns,
        itemMenu: vi.fn((item: MockData) => <div>Menu for {item.name}</div>),
        label: 'Test Table',
      })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - table with label', async () => {
      const { container } = renderTable<MockData>({
        data: testData,
        columns: testColumns,
        label: 'Test Table with Label',
      })
      await expectNoAxeViolations(container)
    })
  })
})
