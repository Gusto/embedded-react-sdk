import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Table } from './Table'
import type { TableData, TableHeaderData, TableRow } from './TableTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Table', () => {
  const testHeaders: TableData[] = [
    { key: 'name', content: 'Name' },
    { key: 'email', content: 'Email' },
    { key: 'status', content: 'Status' },
  ]

  const testRows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'name-1', content: 'John Doe' },
        { key: 'email-1', content: 'john@example.com' },
        { key: 'status-1', content: 'Active' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'name-2', content: 'Jane Smith' },
        { key: 'email-2', content: 'jane@example.com' },
        { key: 'status-2', content: 'Inactive' },
      ],
    },
  ]

  it('renders table with data', () => {
    renderWithProviders(<Table aria-label="User table" headers={testHeaders} rows={testRows} />)

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders empty table', () => {
    renderWithProviders(<Table aria-label="Empty table" headers={testHeaders} rows={[]} />)

    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders empty state when provided', () => {
    const emptyState = <div>No data available</div>
    renderWithProviders(
      <Table
        aria-label="Empty table with message"
        headers={testHeaders}
        rows={[]}
        emptyState={emptyState}
      />,
    )

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    const testFooter: TableData[] = [
      { key: 'footer-name', content: <strong>Total:</strong> },
      { key: 'footer-email', content: '5 users' },
      { key: 'footer-status', content: <strong>All Active</strong> },
    ]

    renderWithProviders(
      <Table
        aria-label="Table with footer"
        headers={testHeaders}
        rows={testRows}
        footer={testFooter}
      />,
    )

    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('5 users')).toBeInTheDocument()
    expect(screen.getByText('All Active')).toBeInTheDocument()
  })

  describe('sorting', () => {
    const sortableHeaders: TableHeaderData[] = [
      { key: 'name', content: 'Name', isSortable: true },
      { key: 'email', content: 'Email' },
      { key: 'status', content: 'Status' },
    ]

    it('reports the sorted column and toggles its direction on activation', async () => {
      const user = userEvent.setup()
      const onSortChange = vi.fn()
      renderWithProviders(
        <Table
          aria-label="User table"
          headers={sortableHeaders}
          rows={testRows}
          sortDescriptor={{ columnKey: 'name', direction: 'ascending' }}
          onSortChange={onSortChange}
        />,
      )

      // The accessible name stays the bare column title, which also proves the sort
      // indicator contributes no text content for `tableQueries` to trip over.
      const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

      await user.click(nameHeader)

      expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'name', direction: 'descending' })
    })

    it('leaves headers unsortable when no sort handler is supplied', async () => {
      const user = userEvent.setup()
      // `sortDescriptor` is supplied but `onSortChange` is not, so an `aria-sort` here
      // could only come from the column still being sortable.
      renderWithProviders(
        <Table
          aria-label="User table"
          headers={sortableHeaders}
          rows={testRows}
          sortDescriptor={{ columnKey: 'name', direction: 'ascending' }}
        />,
      )

      // Absence is the documented contract: `onSortChange` is what makes a column sortable,
      // so without it the header must stay a plain, non-interactive header.
      const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
      expect(nameHeader).not.toHaveAttribute('aria-sort')

      await user.click(nameHeader)
      expect(nameHeader).not.toHaveAttribute('aria-sort')
    })
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic table',
        props: {
          'aria-label': 'Basic table',
          headers: testHeaders,
          rows: testRows,
        },
      },
      {
        name: 'empty table',
        props: {
          'aria-label': 'Empty table',
          headers: testHeaders,
          rows: [],
        },
      },
      {
        name: 'table with empty state',
        props: {
          'aria-label': 'Table with empty state',
          headers: testHeaders,
          rows: [],
          emptyState: <div>No data available</div>,
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Table {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
