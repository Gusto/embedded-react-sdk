import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table } from './Table'
import type { TableProps } from './TableTypes'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'

// Mock the translation function
vi.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: () => Promise.resolve(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'table.selectRowHeader': 'Select Row',
        'table.actionsColumnHeader': 'Actions',
        'table.selectRowLabel': 'Select row',
      }
      return translations[key] || key
    },
  }),
}))

describe('Table Component', () => {
  interface TestUser {
    id: number
    name: string
    email: string
  }

  const testData: TestUser[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ]

  const testColumns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
  ]

  const renderTable = <T,>(props: Partial<TableProps<T>>) => {
    return render(
      <GustoTestApiProvider>
        <Table {...(props as TableProps<T>)} />
      </GustoTestApiProvider>,
    )
  }

  it('should render a complete table structure', () => {
    renderTable({
      'aria-label': 'Basic Table',
      data: testData,
      columns: testColumns,
    })

    const table = screen.getByRole('grid', { name: 'Basic Table' })
    expect(table).toBeInTheDocument()

    // Check header content - get all column headers including the ones in the header row
    const headers = within(table).getAllByRole('columnheader')

    // Find the header row headers
    const headerRowHeaders = headers.filter(header => header.getAttribute('aria-colindex') !== null)
    expect(headerRowHeaders).toHaveLength(3)
    expect(headerRowHeaders[0]).toHaveTextContent('ID')
    expect(headerRowHeaders[1]).toHaveTextContent('Name')
    expect(headerRowHeaders[2]).toHaveTextContent('Email')

    // Check cells - in react-aria-components implementation, cells have role="gridcell"
    const cells = within(table).getAllByRole('gridcell')
    expect(cells.length).toBe(6) // 2 rows × 3 columns

    // First row
    expect(cells[0]).toHaveTextContent('1')
    expect(cells[1]).toHaveTextContent('John Doe')
    expect(cells[2]).toHaveTextContent('john@example.com')

    // Second row
    expect(cells[3]).toHaveTextContent('2')
    expect(cells[4]).toHaveTextContent('Jane Smith')
    expect(cells[5]).toHaveTextContent('jane@example.com')
  })

  it('should apply custom className to table', () => {
    renderTable({
      'aria-label': 'Custom Table',
      className: 'custom-table',
      data: testData,
      columns: testColumns,
    })

    // The className is applied to the AriaTable element
    const table = screen.getByRole('grid')

    // The table should have the custom class
    expect(table).toHaveClass('custom-table')
  })

  it('should render custom cell content using render functions', () => {
    const columnsWithRender = [
      { key: 'id', title: 'ID' },
      { key: 'name', title: 'Name' },
      {
        key: 'email',
        title: 'Contact',
        render: (item: TestUser) => <a href={`mailto:${item.email}`}>{item.email}</a>,
      },
    ]

    renderTable({
      'aria-label': 'Table with custom render',
      data: testData,
      columns: columnsWithRender,
    })

    const emailLinks = screen.getAllByRole('link')
    expect(emailLinks).toHaveLength(2)
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:john@example.com')
    expect(emailLinks[1]).toHaveAttribute('href', 'mailto:jane@example.com')
  })

  it('should render a selection column when onSelect is provided', () => {
    const onSelect = vi.fn()

    renderTable({
      'aria-label': 'Table with selection',
      data: testData,
      columns: testColumns,
      onSelect,
    })

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2) // One checkbox for each row
  })

  it('should call onSelect when a checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderTable({
      'aria-label': 'Table with selection',
      data: testData,
      columns: testColumns,
      onSelect,
    })

    // Get all checkboxes and click the first one
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0]!)

    expect(onSelect).toHaveBeenCalledWith(testData[0], true)
  })

  it('should render an actions column when itemMenu is provided', () => {
    const itemMenu = (item: TestUser) => <button>Edit {item.name}</button>

    renderTable<TestUser>({
      'aria-label': 'Table with actions',
      data: testData,
      columns: testColumns,
      itemMenu,
    })

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('Edit John Doe')
    expect(buttons[1]).toHaveTextContent('Edit Jane Smith')
  })

  it('should render empty state when data is empty and emptyState is provided', () => {
    const emptyState = () => <div>No data available</div>

    renderTable({
      'aria-label': 'Empty Table',
      data: [],
      columns: testColumns,
      emptyState,
    })

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should handle columns with isRowHeader property', () => {
    const columnsWithRowHeader = [
      { key: 'id', title: 'ID', isRowHeader: true },
      { key: 'name', title: 'Name' },
      { key: 'email', title: 'Email' },
    ]

    renderTable({
      'aria-label': 'Table with row headers',
      data: testData,
      columns: columnsWithRowHeader,
    })

    const headers = screen.getAllByRole('columnheader')
    expect(headers[0]).toHaveTextContent('ID')
    expect(headers[0]).toHaveAttribute('aria-colindex', '1')
  })
})
