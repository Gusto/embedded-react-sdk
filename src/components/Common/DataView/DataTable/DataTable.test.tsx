import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataTable } from '@/components/Common/DataView/DataTable/DataTable'
import type { DataTableProps } from '@/components/Common/DataView/DataTable/DataTable'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'

type MockData = { id: number; name: string; age: number }

const testData: MockData[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
]

const testColumns: useDataViewPropReturn<MockData>['columns'] = [
  { key: 'name', title: 'Name', render: (item: MockData) => item.name },
  { key: 'age', title: 'Age', render: (item: MockData) => item.age.toString() },
]

const baseProps: DataTableProps<MockData> = {
  data: testData,
  columns: testColumns,
  label: 'Test Table',
}

const selectableProps: DataTableProps<MockData> = {
  ...baseProps,
  onSelect: vi.fn(),
  isItemSelected: () => false,
  selectionMode: 'multiple',
}

const renderTable = (overrides: Partial<DataTableProps<MockData>> = {}) =>
  render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <DataTable<MockData> {...baseProps} {...overrides} />
      </ComponentsProvider>
    </ThemeProvider>,
  )

describe('DataTable Component', () => {
  test('should render the table structure', () => {
    renderTable({ data: [], columns: [] })
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
  })

  test('should render the table with data and columns', () => {
    renderTable()
    expect(screen.getAllByRole('row')).toHaveLength(testData.length + 1)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  test('should render checkboxes and call onSelect when clicked', async () => {
    const onSelectMock = vi.fn()
    renderTable({ onSelect: onSelectMock })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(testData.length)

    await userEvent.click(checkboxes[0] as HTMLElement)
    expect(onSelectMock).toHaveBeenCalledWith(testData[0], true, 0)
  })

  test('should render radio buttons when selectionMode is single', async () => {
    const onSelectMock = vi.fn()
    renderTable({ onSelect: onSelectMock, selectionMode: 'single' })

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(testData.length)

    await userEvent.click(radios[0] as HTMLElement)
    expect(onSelectMock).toHaveBeenCalledWith(testData[0], true, 0)
  })

  test('radio buttons should share the same name for single selection', () => {
    renderTable({ onSelect: vi.fn(), selectionMode: 'single' })
    const radios = screen.getAllByRole('radio')
    const firstName = radios[0]?.getAttribute('name')
    radios.forEach(radio => {
      expect(radio.getAttribute('name')).toBe(firstName)
    })
  })

  test('should default to checkbox selectionMode when not specified', () => {
    renderTable({ onSelect: vi.fn() })
    expect(screen.getAllByRole('checkbox')).toHaveLength(testData.length)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  describe('select-all header checkbox', () => {
    test('renders a header checkbox when selectionMode is multiple and isItemSelected is provided', () => {
      renderTable(selectableProps)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(testData.length + 1)
      expect(checkboxes[0]).toHaveAccessibleName('table.selectAllRowsLabel')
    })

    test('does not render header checkbox when isItemSelected is not provided', () => {
      renderTable({ onSelect: vi.fn(), selectionMode: 'multiple' })
      expect(screen.getAllByRole('checkbox')).toHaveLength(testData.length)
    })

    test('header checkbox is checked when all rows are selected', () => {
      renderTable({ ...selectableProps, isItemSelected: () => true })
      expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
    })

    test('header checkbox is unchecked when no rows are selected', () => {
      renderTable(selectableProps)
      expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
    })

    test('header checkbox is indeterminate when some but not all rows are selected', () => {
      renderTable({ ...selectableProps, isItemSelected: (_item, index) => index === 0 })
      const headerCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
      expect(headerCheckbox.indeterminate).toBe(true)
    })

    test('clicking the header checkbox fires onSelectAll with checked=true when not all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderTable({ ...selectableProps, onSelectAll: onSelectAllMock })
      await userEvent.click(screen.getAllByRole('checkbox')[0] as Element)
      expect(onSelectAllMock).toHaveBeenCalledWith(true, testData)
    })

    test('clicking the header checkbox fires onSelectAll with checked=false when all selected', async () => {
      const onSelectAllMock = vi.fn()
      renderTable({ ...selectableProps, onSelectAll: onSelectAllMock, isItemSelected: () => true })
      await userEvent.click(screen.getAllByRole('checkbox')[0] as Element)
      expect(onSelectAllMock).toHaveBeenCalledWith(false, testData)
    })

    test('does not render a header checkbox for single selectionMode', () => {
      renderTable({ onSelect: vi.fn(), selectionMode: 'single' })
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
      expect(screen.getAllByRole('radio')).toHaveLength(testData.length)
    })
  })

  test('should render itemMenu when provided', () => {
    renderTable({ itemMenu: (item: MockData) => <div>Menu for {item.name}</div> })
    expect(screen.getByText('Menu for Alice')).toBeInTheDocument()
    expect(screen.getByText('Menu for Bob')).toBeInTheDocument()
  })

  test('should render footer when provided', () => {
    renderTable({
      footer: () => ({ name: <strong>Total Records:</strong>, age: <strong>55</strong> }),
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
              {...baseProps}
              selectionMode="multiple"
              isItemSelected={(_item, index) => selectedIndices.has(index)}
              onSelect={(_item, checked, index) => {
                setSelectedIndices(prev => {
                  const next = new Set(prev)
                  checked ? next.add(index) : next.delete(index)
                  return next
                })
              }}
              onSelectAll={checked => {
                setSelectedIndices(checked ? new Set(testData.map((_, i) => i)) : new Set())
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
      const getHeaderWrapper = () => getHeaderCheckbox().closest('[data-checked]')
      const getCheckedRowCount = () =>
        screen
          .getAllByRole('checkbox')
          .slice(1)
          .filter(cb => cb.closest('[data-checked]')?.getAttribute('data-checked') === 'true')
          .length

      expect(getHeaderWrapper()).toHaveAttribute('data-checked', 'false')
      expect(getCheckedRowCount()).toBe(0)

      await userEvent.click(getHeaderCheckbox())
      expect(getHeaderWrapper()).toHaveAttribute('data-checked', 'true')
      expect(getCheckedRowCount()).toBe(testData.length)

      await userEvent.click(getFirstRowCheckbox())
      expect(getHeaderWrapper()).toHaveAttribute('data-indeterminate', 'true')
      expect(getCheckedRowCount()).toBe(testData.length - 1)

      await userEvent.click(getHeaderCheckbox())
      expect(getHeaderWrapper()).toHaveAttribute('data-checked', 'true')
      expect(getCheckedRowCount()).toBe(testData.length)

      await userEvent.click(getHeaderCheckbox())
      expect(getHeaderWrapper()).toHaveAttribute('data-checked', 'false')
      expect(getHeaderWrapper()).toHaveAttribute('data-indeterminate', 'false')
      expect(getCheckedRowCount()).toBe(0)
    })
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations - empty table', async () => {
      const { container } = renderTable({ data: [], columns: [] })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - data table with content', async () => {
      const { container } = renderTable()
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - interactive table with checkboxes', async () => {
      const { container } = renderTable({ onSelect: vi.fn() })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - interactive table with radio buttons', async () => {
      const { container } = renderTable({ onSelect: vi.fn(), selectionMode: 'single' })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - table with custom menu content', async () => {
      const { container } = renderTable({
        itemMenu: (item: MockData) => <div>Menu for {item.name}</div>,
      })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - table with label', async () => {
      const { container } = renderTable({ label: 'Test Table with Label' })
      await expectNoAxeViolations(container)
    })
  })
})
