import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { Table } from './Table'
import type { TableProps, TableData, TableRow } from './TableTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

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

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic table with aria-label',
        render: () => <Table aria-label="User data table" headers={testHeaders} rows={testRows} />,
      },
      {
        name: 'table with aria-labelledby',
        render: () => (
          <div>
            <h2 id="table-title">Employee Directory</h2>
            <Table aria-labelledby="table-title" headers={testHeaders} rows={testRows} />
          </div>
        ),
      },
      {
        name: 'empty table with emptyState',
        render: () => (
          <Table
            aria-label="Empty data table"
            headers={testHeaders}
            rows={[]}
            emptyState={<div>No data available</div>}
          />
        ),
      },
      {
        name: 'table with interactive content',
        render: () => {
          const interactiveRows: TableRow[] = [
            {
              key: 'row-1',
              data: [
                { key: 'id-1', content: '1' },
                { key: 'name-1', content: 'John Doe' },
                { key: 'actions-1', content: <button type="button">Edit</button> },
              ],
            },
            {
              key: 'row-2',
              data: [
                { key: 'id-2', content: '2' },
                { key: 'name-2', content: 'Jane Smith' },
                { key: 'actions-2', content: <button type="button">Edit</button> },
              ],
            },
          ]

          const interactiveHeaders: TableData[] = [
            { key: 'id-header', content: 'ID' },
            { key: 'name-header', content: 'Name' },
            { key: 'actions-header', content: 'Actions' },
          ]

          return (
            <Table
              aria-label="Interactive data table"
              headers={interactiveHeaders}
              rows={interactiveRows}
            />
          )
        },
      },
      {
        name: 'table with links',
        render: () => {
          const linkRows: TableRow[] = [
            {
              key: 'row-1',
              data: [
                { key: 'id-1', content: '1' },
                { key: 'name-1', content: <a href="/users/1">John Doe</a> },
                { key: 'email-1', content: <a href="mailto:john@example.com">john@example.com</a> },
              ],
            },
            {
              key: 'row-2',
              data: [
                { key: 'id-2', content: '2' },
                { key: 'name-2', content: <a href="/users/2">Jane Smith</a> },
                { key: 'email-2', content: <a href="mailto:jane@example.com">jane@example.com</a> },
              ],
            },
          ]

          return <Table aria-label="User links table" headers={testHeaders} rows={linkRows} />
        },
      },
      {
        name: 'table with custom className',
        render: () => (
          <Table
            aria-label="Styled table"
            className="custom-table-style"
            headers={testHeaders}
            rows={testRows}
          />
        ),
      },
      {
        name: 'table with complex headers',
        render: () => {
          const complexHeaders: TableData[] = [
            { key: 'employee-info', content: 'Employee Information' },
            { key: 'contact-details', content: 'Contact Details' },
            { key: 'department', content: 'Department' },
            { key: 'status', content: 'Employment Status' },
          ]

          const complexRows: TableRow[] = [
            {
              key: 'row-1',
              data: [
                { key: 'info-1', content: 'John Doe (ID: 001)' },
                { key: 'contact-1', content: 'john@example.com | (555) 123-4567' },
                { key: 'dept-1', content: 'Engineering' },
                { key: 'status-1', content: 'Full-time' },
              ],
            },
            {
              key: 'row-2',
              data: [
                { key: 'info-2', content: 'Jane Smith (ID: 002)' },
                { key: 'contact-2', content: 'jane@example.com | (555) 987-6543' },
                { key: 'dept-2', content: 'Design' },
                { key: 'status-2', content: 'Part-time' },
              ],
            },
          ]

          return (
            <Table
              aria-label="Employee directory table"
              headers={complexHeaders}
              rows={complexRows}
            />
          )
        },
      },
      {
        name: 'large table with many rows',
        render: () => {
          const manyHeaders: TableData[] = [
            { key: 'col1', content: 'Column 1' },
            { key: 'col2', content: 'Column 2' },
            { key: 'col3', content: 'Column 3' },
            { key: 'col4', content: 'Column 4' },
            { key: 'col5', content: 'Column 5' },
          ]

          const manyRows: TableRow[] = Array.from({ length: 10 }, (_, i) => ({
            key: `row-${i}`,
            data: [
              { key: `col1-${i}`, content: `Row ${i + 1} Col 1` },
              { key: `col2-${i}`, content: `Row ${i + 1} Col 2` },
              { key: `col3-${i}`, content: `Row ${i + 1} Col 3` },
              { key: `col4-${i}`, content: `Row ${i + 1} Col 4` },
              { key: `col5-${i}`, content: `Row ${i + 1} Col 5` },
            ],
          }))

          return <Table aria-label="Large data table" headers={manyHeaders} rows={manyRows} />
        },
      },
      {
        name: 'table with numeric data',
        render: () => {
          const numericHeaders: TableData[] = [
            { key: 'item', content: 'Item' },
            { key: 'quantity', content: 'Quantity' },
            { key: 'price', content: 'Price ($)' },
            { key: 'total', content: 'Total ($)' },
          ]

          const numericRows: TableRow[] = [
            {
              key: 'row-1',
              data: [
                { key: 'item-1', content: 'Widget A' },
                { key: 'qty-1', content: '5' },
                { key: 'price-1', content: '19.99' },
                { key: 'total-1', content: '99.95' },
              ],
            },
            {
              key: 'row-2',
              data: [
                { key: 'item-2', content: 'Widget B' },
                { key: 'qty-2', content: '3' },
                { key: 'price-2', content: '29.99' },
                { key: 'total-2', content: '89.97' },
              ],
            },
          ]

          return (
            <Table aria-label="Product pricing table" headers={numericHeaders} rows={numericRows} />
          )
        },
      },
      {
        name: 'single row table',
        render: () => {
          const singleRow: TableRow[] = [
            {
              key: 'row-1',
              data: [
                { key: 'id-1', content: '1' },
                { key: 'name-1', content: 'Single Entry' },
                { key: 'email-1', content: 'single@example.com' },
              ],
            },
          ]

          return <Table aria-label="Single entry table" headers={testHeaders} rows={singleRow} />
        },
      },
      {
        name: 'table with mixed content types',
        render: () => {
          const mixedHeaders: TableData[] = [
            { key: 'text', content: 'Text' },
            { key: 'number', content: 'Number' },
            { key: 'link', content: 'Link' },
            { key: 'button', content: 'Action' },
          ]

          const mixedRows: TableRow[] = [
            {
              key: 'row-1',
              data: [
                { key: 'text-1', content: 'Sample text content' },
                { key: 'number-1', content: '42' },
                { key: 'link-1', content: <a href="/example">Visit page</a> },
                {
                  key: 'button-1',
                  content: (
                    <button type="button" aria-label="Delete item">
                      ×
                    </button>
                  ),
                },
              ],
            },
            {
              key: 'row-2',
              data: [
                { key: 'text-2', content: 'Another text entry' },
                { key: 'number-2', content: '73' },
                { key: 'link-2', content: <a href="/another">Another page</a> },
                {
                  key: 'button-2',
                  content: (
                    <button type="button" aria-label="Edit item">
                      ✎
                    </button>
                  ),
                },
              ],
            },
          ]

          return <Table aria-label="Mixed content table" headers={mixedHeaders} rows={mixedRows} />
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ render }) => {
        const { container } = renderWithProviders(render())
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      },
    )
  })
})
