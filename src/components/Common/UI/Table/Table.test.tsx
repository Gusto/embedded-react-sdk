import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Table } from './Table'
import type { TableData, TableRow } from './TableTypes'
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
