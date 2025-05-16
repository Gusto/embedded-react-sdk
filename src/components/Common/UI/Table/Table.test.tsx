import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { Table } from './Table'
import type { TableProps, TableData, TableRow } from './TableTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Table Component', () => {
  // Sample test data to build headers and rows
  const testHeaders: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Name' },
    { key: 'email-header', content: 'Email' },
  ]

  const testRows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: '1' },
        { key: 'name-1', content: 'John Doe' },
        { key: 'email-1', content: 'john@example.com' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: '2' },
        { key: 'name-2', content: 'Jane Smith' },
        { key: 'email-2', content: 'jane@example.com' },
      ],
    },
  ]

  const renderTable = (props: Partial<TableProps>) => {
    return renderWithProviders(<Table {...(props as TableProps)} />)
  }

  it('should render a complete table structure', () => {
    renderTable({
      'aria-label': 'Basic Table',
      headers: testHeaders,
      rows: testRows,
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

    // With react-aria-components, the first column is now a row header
    // The row header cells have role="rowheader" and other cells have role="gridcell"
    const rowHeaders = within(table).getAllByRole('rowheader')
    const gridCells = within(table).getAllByRole('gridcell')

    // We should have 2 row headers (one for each row's first column - ID)
    expect(rowHeaders).toHaveLength(2)
    expect(rowHeaders[0]).toHaveTextContent('1')
    expect(rowHeaders[1]).toHaveTextContent('2')

    // We should have 4 grid cells (remaining cells)
    expect(gridCells).toHaveLength(4)

    // First row (after the ID column which is now a rowheader)
    expect(gridCells[0]).toHaveTextContent('John Doe')
    expect(gridCells[1]).toHaveTextContent('john@example.com')

    // Second row (after the ID column which is now a rowheader)
    expect(gridCells[2]).toHaveTextContent('Jane Smith')
    expect(gridCells[3]).toHaveTextContent('jane@example.com')
  })

  it('should apply custom className to table', () => {
    renderTable({
      'aria-label': 'Custom Table',
      className: 'custom-table',
      headers: testHeaders,
      rows: testRows,
    })

    // The className is applied to the AriaTable element
    const table = screen.getByRole('grid')

    // The table should have the custom class
    expect(table).toHaveClass('custom-table')
  })

  it('should render custom content', () => {
    const headersWithLink = [...testHeaders]

    const rowsWithLink: TableRow[] = [
      {
        key: 'row-1',
        data: [
          { key: 'id-1', content: '1' },
          { key: 'name-1', content: 'John Doe' },
          { key: 'email-1', content: <a href="mailto:john@example.com">john@example.com</a> },
        ],
      },
      {
        key: 'row-2',
        data: [
          { key: 'id-2', content: '2' },
          { key: 'name-2', content: 'Jane Smith' },
          { key: 'email-2', content: <a href="mailto:jane@example.com">jane@example.com</a> },
        ],
      },
    ]

    renderTable({
      'aria-label': 'Table with custom content',
      headers: headersWithLink,
      rows: rowsWithLink,
    })

    const emailLinks = screen.getAllByRole('link')
    expect(emailLinks).toHaveLength(2)
    expect(emailLinks[0]).toHaveAttribute('href', 'mailto:john@example.com')
    expect(emailLinks[1]).toHaveAttribute('href', 'mailto:jane@example.com')
  })

  it('should render empty state when rows are empty and emptyState is provided', () => {
    const emptyStateContent = <div>No data available</div>

    renderTable({
      'aria-label': 'Empty Table',
      headers: testHeaders,
      rows: [],
      emptyState: emptyStateContent,
    })

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})
