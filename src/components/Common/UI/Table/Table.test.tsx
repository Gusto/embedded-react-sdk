import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    const sortControls = {
      onSort: vi.fn(),
      onSortAscending: vi.fn(),
      onSortDescending: vi.fn(),
      onClearSort: vi.fn(),
    }

    const headersSortedBy = (
      sortDirection: 'ascending' | 'descending' | 'none',
    ): TableHeaderData[] => [
      { key: 'name', content: 'Name', isSortable: true, sortDirection, ...sortControls },
      { key: 'email', content: 'Email' },
      { key: 'status', content: 'Status' },
    ]

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it.each([['ascending'], ['descending']] as const)(
      'reports a column sorted %s to assistive technology',
      sortDirection => {
        renderWithProviders(
          <Table
            aria-label="User table"
            headers={headersSortedBy(sortDirection)}
            rows={testRows}
          />,
        )

        // The accessible name stays the bare column title, which also proves the sort
        // indicator contributes no text content for `tableQueries` to trip over.
        expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
          'aria-sort',
          sortDirection,
        )
      },
    )

    it("advances the activated column's own sort cycle", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Table aria-label="User table" headers={headersSortedBy('ascending')} rows={testRows} />,
      )

      await user.click(screen.getByRole('columnheader', { name: 'Name' }))

      // The header owns the cycle, so the direction react-aria would have suggested is irrelevant.
      expect(sortControls.onSort).toHaveBeenCalledTimes(1)
    })

    it('leaves a column without sort controls non-interactive', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <Table aria-label="User table" headers={headersSortedBy('ascending')} rows={testRows} />,
      )

      // Absence is the contract: only a header carrying sort controls is sortable, so a plain
      // header must stay a plain header even while a sibling column is sorted.
      const emailHeader = screen.getByRole('columnheader', { name: 'Email' })
      expect(emailHeader).not.toHaveAttribute('aria-sort')

      await user.click(emailHeader)
      expect(sortControls.onSort).not.toHaveBeenCalled()
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
