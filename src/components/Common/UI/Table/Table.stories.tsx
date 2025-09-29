import { Badge } from '../Badge/Badge'
import type { TableData, TableRow } from './TableTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Table',
}

export const Default = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Name' },
    { key: 'email-header', content: 'Email' },
    { key: 'role-header', content: 'Role' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: '1' },
        { key: 'name-1', content: 'John Doe' },
        { key: 'email-1', content: 'john@example.com' },
        { key: 'role-1', content: 'Admin' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: '2' },
        { key: 'name-2', content: 'Jane Smith' },
        { key: 'email-2', content: 'jane@example.com' },
        { key: 'role-2', content: 'User' },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'id-3', content: '3' },
        { key: 'name-3', content: 'Bob Johnson' },
        { key: 'email-3', content: 'bob@example.com' },
        { key: 'role-3', content: 'Editor' },
      ],
    },
  ]

  return <Table aria-label="Users" headers={headers} rows={rows} />
}

export const WithCustomContent = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Name' },
    { key: 'email-header', content: 'Contact' },
    { key: 'role-header', content: 'Role' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: '1' },
        { key: 'name-1', content: 'John Doe' },
        { key: 'email-1', content: <a href="mailto:john@example.com">john@example.com</a> },
        { key: 'role-1', content: <span style={{ fontWeight: 'bold' }}>Admin</span> },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: '2' },
        { key: 'name-2', content: 'Jane Smith' },
        { key: 'email-2', content: <a href="mailto:jane@example.com">jane@example.com</a> },
        { key: 'role-2', content: <span>User</span> },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'id-3', content: '3' },
        { key: 'name-3', content: 'Bob Johnson' },
        { key: 'email-3', content: <a href="mailto:bob@example.com">bob@example.com</a> },
        { key: 'role-3', content: <span>Editor</span> },
      ],
    },
  ]

  return <Table aria-label="Users with custom content" headers={headers} rows={rows} />
}

export const EmptyState = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Name' },
    { key: 'email-header', content: 'Email' },
    { key: 'role-header', content: 'Role' },
  ]

  const emptyState = <div>No users found</div>

  return (
    <Table aria-label="Empty users table" headers={headers} rows={[]} emptyState={emptyState} />
  )
}

export const ComplexTable = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Employee' },
    { key: 'department-header', content: 'Department' },
    { key: 'rate-header', content: 'Pay Rate' },
    { key: 'hours-header', content: 'Hours' },
    { key: 'pay-header', content: 'Gross Pay' },
    { key: 'status-header', content: 'Status' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: 'EMP001' },
        { key: 'name-1', content: 'Sarah Johnson' },
        { key: 'department-1', content: 'Engineering' },
        { key: 'rate-1', content: '$45.00/hr' },
        { key: 'hours-1', content: '80' },
        { key: 'pay-1', content: '$3,600.00' },
        { key: 'status-1', content: <Badge status="success">Paid</Badge> },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: 'EMP002' },
        { key: 'name-2', content: 'Michael Chen' },
        { key: 'department-2', content: 'Sales' },
        { key: 'rate-2', content: '$35.00/hr' },
        { key: 'hours-2', content: '84' },
        { key: 'pay-2', content: '$2,940.00' },
        { key: 'status-2', content: <Badge status="warning">Pending</Badge> },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'id-3', content: 'EMP003' },
        { key: 'name-3', content: 'Emily Rodriguez' },
        { key: 'department-3', content: 'Marketing' },
        { key: 'rate-3', content: '$40.00/hr' },
        { key: 'hours-3', content: '76' },
        { key: 'pay-3', content: '$3,040.00' },
        { key: 'status-3', content: <Badge status="info">Processing</Badge> },
      ],
    },
    {
      key: 'row-4',
      data: [
        { key: 'id-4', content: 'EMP004' },
        { key: 'name-4', content: 'David Kim' },
        { key: 'department-4', content: 'Engineering' },
        { key: 'rate-4', content: '$43.00/hr' },
        { key: 'hours-4', content: '80' },
        { key: 'pay-4', content: '$3,440.00' },
        { key: 'status-4', content: <Badge status="success">Paid</Badge> },
      ],
    },
    {
      key: 'row-5',
      data: [
        { key: 'id-5', content: 'EMP005' },
        { key: 'name-5', content: 'Rachel Foster' },
        { key: 'department-5', content: 'HR' },
        { key: 'rate-5', content: '$38.00/hr' },
        { key: 'hours-5', content: '78' },
        { key: 'pay-5', content: '$2,964.00' },
        { key: 'status-5', content: <Badge status="warning">Pending</Badge> },
      ],
    },
  ]

  return (
    <div style={{ maxWidth: '1200px' }}>
      <Table aria-label="Employee Payroll" headers={headers} rows={rows} />
    </div>
  )
}

export const WithFooter = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Name' },
    { key: 'department-header', content: 'Department' },
    { key: 'salary-header', content: 'Salary' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: 'EMP001' },
        { key: 'name-1', content: 'Sarah Johnson' },
        { key: 'department-1', content: 'Engineering' },
        { key: 'salary-1', content: '$95,000' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: 'EMP002' },
        { key: 'name-2', content: 'Michael Chen' },
        { key: 'department-2', content: 'Sales' },
        { key: 'salary-2', content: '$72,000' },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'id-3', content: 'EMP003' },
        { key: 'name-3', content: 'Emily Rodriguez' },
        { key: 'department-3', content: 'Marketing' },
        { key: 'salary-3', content: '$78,000' },
      ],
    },
  ]

  const footer: TableData[] = [
    {
      key: 'footer-summary',
      content: (
        <div
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          Total Employees: 3 | Average Salary: $81,667
        </div>
      ),
    },
  ]

  return <Table aria-label="Employees with footer" headers={headers} rows={rows} footer={footer} />
}

export const WithDetailedFooter = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'item-header', content: 'Item' },
    { key: 'quantity-header', content: 'Quantity' },
    { key: 'price-header', content: 'Unit Price' },
    { key: 'total-header', content: 'Total' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'item-1', content: 'Premium Widget' },
        { key: 'quantity-1', content: '5' },
        { key: 'price-1', content: '$29.99' },
        { key: 'total-1', content: '$149.95' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'item-2', content: 'Standard Widget' },
        { key: 'quantity-2', content: '12' },
        { key: 'price-2', content: '$19.99' },
        { key: 'total-2', content: '$239.88' },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'item-3', content: 'Basic Widget' },
        { key: 'quantity-3', content: '8' },
        { key: 'price-3', content: '$9.99' },
        { key: 'total-3', content: '$79.92' },
      ],
    },
  ]

  const footer: TableData[] = [
    { key: 'footer-label', content: 'Subtotal:' },
    { key: 'footer-empty-1', content: '' },
    { key: 'footer-empty-2', content: '' },
    { key: 'footer-subtotal', content: <strong>$469.75</strong> },
  ]

  return (
    <Table
      aria-label="Invoice with detailed footer"
      headers={headers}
      rows={rows}
      footer={footer}
    />
  )
}

export const MinimalVariant = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Name' },
    { key: 'email-header', content: 'Email' },
    { key: 'role-header', content: 'Role' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: '1' },
        { key: 'name-1', content: 'John Doe' },
        { key: 'email-1', content: 'john@example.com' },
        { key: 'role-1', content: 'Admin' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: '2' },
        { key: 'name-2', content: 'Jane Smith' },
        { key: 'email-2', content: 'jane@example.com' },
        { key: 'role-2', content: 'User' },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'id-3', content: '3' },
        { key: 'name-3', content: 'Bob Johnson' },
        { key: 'email-3', content: 'bob@example.com' },
        { key: 'role-3', content: 'Editor' },
      ],
    },
  ]

  return (
    <Table aria-label="Minimal table variant" headers={headers} rows={rows} variant="minimal" />
  )
}

export const MinimalWithComplexContent = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'id-header', content: 'ID' },
    { key: 'name-header', content: 'Employee' },
    { key: 'department-header', content: 'Department' },
    { key: 'rate-header', content: 'Pay Rate' },
    { key: 'status-header', content: 'Status' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'id-1', content: 'EMP001' },
        { key: 'name-1', content: 'Sarah Johnson' },
        { key: 'department-1', content: 'Engineering' },
        { key: 'rate-1', content: '$45.00/hr' },
        { key: 'status-1', content: <Badge status="success">Paid</Badge> },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'id-2', content: 'EMP002' },
        { key: 'name-2', content: 'Michael Chen' },
        { key: 'department-2', content: 'Sales' },
        { key: 'rate-2', content: '$35.00/hr' },
        { key: 'status-2', content: <Badge status="warning">Pending</Badge> },
      ],
    },
    {
      key: 'row-3',
      data: [
        { key: 'id-3', content: 'EMP003' },
        { key: 'name-3', content: 'Emily Rodriguez' },
        { key: 'department-3', content: 'Marketing' },
        { key: 'rate-3', content: '$40.00/hr' },
        { key: 'status-3', content: <Badge status="info">Processing</Badge> },
      ],
    },
  ]

  return (
    <Table
      aria-label="Minimal table with complex content"
      headers={headers}
      rows={rows}
      variant="minimal"
    />
  )
}

export const VariantComparison = () => {
  const { Table } = useComponentContext()

  const headers: TableData[] = [
    { key: 'name-header', content: 'Name' },
    { key: 'email-header', content: 'Email' },
    { key: 'role-header', content: 'Role' },
  ]

  const rows: TableRow[] = [
    {
      key: 'row-1',
      data: [
        { key: 'name-1', content: 'John Doe' },
        { key: 'email-1', content: 'john@example.com' },
        { key: 'role-1', content: 'Admin' },
      ],
    },
    {
      key: 'row-2',
      data: [
        { key: 'name-2', content: 'Jane Smith' },
        { key: 'email-2', content: 'jane@example.com' },
        { key: 'role-2', content: 'User' },
      ],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
          Default Variant
        </h3>
        <Table aria-label="Default table variant" headers={headers} rows={rows} />
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
          Minimal Variant
        </h3>
        <Table aria-label="Minimal table variant" headers={headers} rows={rows} variant="minimal" />
      </div>
    </div>
  )
}
