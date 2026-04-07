import { useState } from 'react'
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
    // +1 for the header select-all checkbox
    expect(checkboxes).toHaveLength(testData.length + 1)

    const firstRowCheckbox = checkboxes.at(1)
    expect(firstRowCheckbox).toBeDefined()

    if (firstRowCheckbox) {
      await userEvent.click(firstRowCheckbox)
      expect(onSelectMock).toHaveBeenCalledWith(testData[0], true)
    }
  })

  test('should render radio buttons when selectionMode is single', async () => {
    const onSelectMock = vi.fn()
    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      onSelect: onSelectMock,
      selectionMode: 'single',
      label: 'Test Table',
    })

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(testData.length)

    const firstRadio = radios.at(0)
    expect(firstRadio).toBeDefined()

    if (firstRadio) {
      await userEvent.click(firstRadio)
      expect(onSelectMock).toHaveBeenCalledWith(testData[0], true)
    }
  })

  test('radio buttons should share the same name for single selection', () => {
    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      onSelect: vi.fn(),
      selectionMode: 'single',
      label: 'Test Table',
    })

    const radios = screen.getAllByRole('radio')
    const firstName = radios[0]?.getAttribute('name')

    radios.forEach(radio => {
      expect(radio.getAttribute('name')).toBe(firstName)
    })
  })

  test('should default to checkbox selectionMode when not specified', () => {
    renderTable<MockData>({
      data: testData,
      columns: testColumns,
      onSelect: vi.fn(),
      label: 'Test Table',
    })

    // +1 for the header select-all checkbox
    expect(screen.getAllByRole('checkbox')).toHaveLength(testData.length + 1)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  describe('select-all header checkbox', () => {
    test('renders a header checkbox when selectionMode is multiple and onSelect is set', () => {
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        selectionMode: 'multiple',
        label: 'Test Table',
      })

      const checkboxes = screen.getAllByRole('checkbox')
      // First checkbox is the header select-all
      expect(checkboxes).toHaveLength(testData.length + 1)
      expect(checkboxes[0]).toHaveAccessibleName('table.selectAllRowsLabel')
    })

    test('header checkbox is checked when all rows are selected via isItemSelected', () => {
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        isItemSelected: () => true,
        selectionMode: 'multiple',
        label: 'Test Table',
      })

      const headerCheckbox = screen.getAllByRole('checkbox')[0]
      expect(headerCheckbox).toBeChecked()
    })

    test('header checkbox is unchecked when no rows are selected', () => {
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        isItemSelected: () => false,
        selectionMode: 'multiple',
        label: 'Test Table',
      })

      const headerCheckbox = screen.getAllByRole('checkbox')[0]
      expect(headerCheckbox).not.toBeChecked()
    })

    test('header checkbox is indeterminate when some but not all rows are selected', () => {
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        isItemSelected: (_item, index) => index === 0,
        selectionMode: 'multiple',
        label: 'Test Table',
      })

      const headerCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
      expect(headerCheckbox.indeterminate).toBe(true)
    })

    test('clicking the header checkbox fires onSelectAll with checked=true when not all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        onSelectAll: onSelectAllMock,
        isItemSelected: () => false,
        selectionMode: 'multiple',
        label: 'Test Table',
      })

      const headerCheckbox = screen.getAllByRole('checkbox')[0] as Element
      await userEvent.click(headerCheckbox)
      expect(onSelectAllMock).toHaveBeenCalledWith(true)
    })

    test('clicking the header checkbox fires onSelectAll with checked=false when all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        onSelectAll: onSelectAllMock,
        isItemSelected: () => true,
        selectionMode: 'multiple',
        label: 'Test Table',
      })

      const headerCheckbox = screen.getAllByRole('checkbox')[0] as Element
      await userEvent.click(headerCheckbox)
      expect(onSelectAllMock).toHaveBeenCalledWith(false)
    })

    test('does not render a header checkbox for single selectionMode', () => {
      renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        selectionMode: 'single',
        label: 'Test Table',
      })

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
      expect(screen.getAllByRole('radio')).toHaveLength(testData.length)
    })
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

  describe('controlled select-all cycle', () => {
    function ControlledSelectAllTable() {
      const [selectedIndices, setSelectedIndices] = useState(new Set<number>())

      return (
        <ThemeProvider>
          <ComponentsProvider value={defaultComponents}>
            <DataTable<MockData>
              label="Controlled Table"
              data={testData}
              columns={testColumns}
              selectionMode="multiple"
              isItemSelected={(_item, index) => selectedIndices.has(index)}
              onSelect={(item, checked) => {
                const index = testData.indexOf(item)
                setSelectedIndices(prev => {
                  const next = new Set(prev)
                  if (checked) {
                    next.add(index)
                  } else {
                    next.delete(index)
                  }
                  return next
                })
              }}
              onSelectAll={checked => {
                if (checked) {
                  setSelectedIndices(new Set(testData.map((_, i) => i)))
                } else {
                  setSelectedIndices(new Set())
                }
              }}
            />
          </ComponentsProvider>
        </ThemeProvider>
      )
    }

    test('full select-all -> uncheck one -> re-select -> deselect cycle', async () => {
      render(<ControlledSelectAllTable />)

      const getHeaderCheckbox = () => screen.getAllByRole('checkbox')[0] as HTMLElement
      const getFirstRowCheckbox = () => screen.getAllByRole('checkbox')[1] as HTMLElement

      const getHeaderWrapper = () => getHeaderCheckbox().closest('[class*=checkboxWrapper]')

      const getCheckedRowCount = () =>
        screen
          .getAllByRole('checkbox')
          .slice(1)
          .filter(cb => cb.closest('[class*=checkboxWrapper]')?.className.includes('checked'))
          .length

      expect(getHeaderWrapper()?.className).not.toContain('checked')
      expect(getCheckedRowCount()).toBe(0)

      await userEvent.click(getHeaderCheckbox())
      expect(getHeaderWrapper()?.className).toContain('checked')
      expect(getCheckedRowCount()).toBe(testData.length)

      await userEvent.click(getFirstRowCheckbox())
      expect(getHeaderWrapper()?.className).toContain('indeterminate')
      expect(getCheckedRowCount()).toBe(testData.length - 1)

      await userEvent.click(getHeaderCheckbox())
      expect(getHeaderWrapper()?.className).toContain('checked')
      expect(getCheckedRowCount()).toBe(testData.length)

      await userEvent.click(getHeaderCheckbox())
      expect(getHeaderWrapper()?.className).not.toContain('checked')
      expect(getHeaderWrapper()?.className).not.toContain('indeterminate')
      expect(getCheckedRowCount()).toBe(0)
    })
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

    it('should not have any accessibility violations - interactive table with radio buttons', async () => {
      const { container } = renderTable<MockData>({
        data: testData,
        columns: testColumns,
        onSelect: vi.fn(),
        selectionMode: 'single',
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
