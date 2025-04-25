import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Table } from './Table'
import { TableHead } from './TableHead'
import { TableBody } from './TableBody'
import { TableRow } from './TableRow'
import { TableCell } from './TableCell'
import { TableHeader } from './TableHeader'

describe('Table Components', () => {
  const renderBasicTable = () => {
    return render(
      <Table aria-label="Basic Table">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Age</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
  }

  describe('Table', () => {
    it('should render a complete table structure', () => {
      renderBasicTable()

      const table = screen.getByRole('grid', { name: 'Basic Table' })
      expect(table).toBeInTheDocument()

      // Check header content
      const headers = within(table).getAllByRole('columnheader')
      expect(headers).toHaveLength(2)
      expect(headers[0]).toHaveTextContent('Name')
      expect(headers[1]).toHaveTextContent('Age')

      // Check body content
      const cells = within(table).getAllByRole('gridcell')
      expect(cells).toHaveLength(4)
      expect(cells[0]).toHaveTextContent('John Doe')
      expect(cells[1]).toHaveTextContent('30')
      expect(cells[2]).toHaveTextContent('Jane Smith')
      expect(cells[3]).toHaveTextContent('25')
    })

    it('should apply custom className to table', () => {
      render(
        <Table aria-label="Custom Table" className="custom-table">
          <TableHead>
            <TableRow>
              <TableHeader>Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const table = screen.getByRole('grid')
      expect(table).toHaveClass('custom-table')
    })
  })

  describe('TableHead', () => {
    it('should render header section with proper structure', () => {
      render(
        <Table aria-label="Header Test">
          <TableHead>
            <TableRow>
              <TableHeader>Column 1</TableHeader>
              <TableHeader>Column 2</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Item 1</TableCell>
              <TableCell>Item 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(2)
      expect(headers[0]).toHaveTextContent('Column 1')
      expect(headers[1]).toHaveTextContent('Column 2')
    })

    it('should apply custom className to header section', () => {
      render(
        <Table aria-label="Header Test">
          <TableHead className="custom-head" data-testid="header-section">
            <TableRow>
              <TableHeader>Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Item 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      // TableHead renders as a thead element
      const headerSection = screen.getByTestId('header-section')
      expect(headerSection).toHaveClass('custom-head')
    })
  })

  describe('TableBody', () => {
    it('should render body section with rows and cells', () => {
      render(
        <Table aria-label="Body Test">
          <TableHead>
            <TableRow>
              <TableHeader>Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const cells = screen.getAllByRole('gridcell')
      expect(cells).toHaveLength(2)
      expect(cells[0]).toHaveTextContent('Row 1')
      expect(cells[1]).toHaveTextContent('Row 2')
    })

    it('should render empty state when provided and no children', () => {
      render(
        <Table aria-label="Empty Table">
          <TableHead>
            <TableRow>
              <TableHeader>Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody renderEmptyState={() => <div>No data available</div>}>{[]}</TableBody>
        </Table>,
      )

      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('TableRow', () => {
    it('should render row with cells', () => {
      render(
        <Table aria-label="Row Test">
          <TableHead>
            <TableRow>
              <TableHeader>Header 1</TableHeader>
              <TableHeader>Header 2</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(2) // One header row, one body row

      const headerRow = rows[0]!
      const bodyRow = rows[1]!
      expect(headerRow).toBeInTheDocument()
      expect(bodyRow).toBeInTheDocument()

      const headerCells = within(headerRow).getAllByRole('columnheader')
      expect(headerCells).toHaveLength(2)
      expect(headerCells[0]).toHaveTextContent('Header 1')
      expect(headerCells[1]).toHaveTextContent('Header 2')

      const bodyCells = within(bodyRow).getAllByRole('gridcell')
      expect(bodyCells).toHaveLength(2)
      expect(bodyCells[0]).toHaveTextContent('Cell 1')
      expect(bodyCells[1]).toHaveTextContent('Cell 2')
    })
  })

  describe('TableHeader and TableCell', () => {
    it('should render header cells with proper roles', () => {
      render(
        <Table aria-label="Cell Test">
          <TableHead>
            <TableRow>
              <TableHeader>Test Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Test Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const headerCell = screen.getByRole('columnheader')
      const bodyCell = screen.getByRole('gridcell')

      expect(headerCell).toHaveTextContent('Test Header')
      expect(bodyCell).toHaveTextContent('Test Cell')
    })

    it('should support row headers', () => {
      render(
        <Table aria-label="Row Header Test">
          <TableHead>
            <TableRow>
              <TableHeader isRowHeader>Row Header</TableHeader>
              <TableHeader>Normal Header</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Item 1</TableCell>
              <TableCell>Item 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      )

      const headers = screen.getAllByRole('columnheader')
      expect(headers[0]).toHaveTextContent('Row Header')
      expect(headers[0]).toHaveAttribute('aria-colindex', '1')
      expect(headers[1]).toHaveTextContent('Normal Header')
      expect(headers[1]).toHaveAttribute('aria-colindex', '2')
    })
  })
})
