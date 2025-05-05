import type { Story } from '@ladle/react'
import { action } from '@ladle/react'
import { Badge } from '../Badge/Badge'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

export default {
  title: 'UI/Components/Table',
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

// For the complex example
interface EmployeePayroll {
  employeeId: string
  name: string
  department: string
  hourlyRate: number
  hours: number
  status: 'paid' | 'pending' | 'processing'
}

export const Default: Story = () => {
  const { Table } = useComponentContext()

  const data: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ]

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
  ]

  return <Table aria-label="Users" data={data} columns={columns} />
}

export const WithSelectAndItemMenu: Story = () => {
  const { Table } = useComponentContext()

  const data: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ]

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
  ]

  const handleSelect = (item: User, isSelected: boolean) => {
    alert(`User ${item.name} is ${isSelected ? 'selected' : 'unselected'}`)
  }

  const itemMenu = (item: User) => (
    <HamburgerMenu
      items={[
        {
          label: 'Edit',
          icon: <PencilSvg aria-hidden />,
          onClick: () => {
            action('Edit clicked')({ item })
          },
        },
        {
          label: 'Delete',
          icon: <TrashCanSvg aria-hidden />,
          onClick: () => {
            action('Delete clicked')({ item })
          },
        },
      ]}
    />
  )

  return (
    <Table
      aria-label="Users with selection"
      data={data}
      columns={columns}
      onSelect={handleSelect}
      itemMenu={itemMenu}
    />
  )
}

export const WithItemMenu: Story = () => {
  const { Table } = useComponentContext()

  const data: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ]

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
  ]

  const itemMenu = (item: User) => (
    <HamburgerMenu
      items={[
        {
          label: 'Edit',
          icon: <PencilSvg aria-hidden />,
          onClick: () => {
            action('Edit clicked')({ item })
          },
        },
        {
          label: 'Delete',
          icon: <TrashCanSvg aria-hidden />,
          onClick: () => {
            action('Delete clicked')({ item })
          },
        },
      ]}
    />
  )

  return <Table aria-label="Users with menu" data={data} columns={columns} itemMenu={itemMenu} />
}

export const WithCustomRenderer: Story = () => {
  const { Table } = useComponentContext()

  const data: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ]

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    {
      key: 'email',
      title: 'Contact',
      render: (item: User) => <a href={`mailto:${item.email}`}>{item.email}</a>,
    },
    {
      key: 'role',
      title: 'Role',
      render: (item: User) => (
        <span style={{ fontWeight: item.role === 'Admin' ? 'bold' : 'normal' }}>{item.role}</span>
      ),
    },
  ]

  return <Table aria-label="Users with custom renderers" data={data} columns={columns} />
}

export const EmptyState: Story = () => {
  const { Table } = useComponentContext()

  const data: User[] = []

  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Role' },
  ]

  const emptyState = () => <div>No users found</div>

  return (
    <Table aria-label="Empty users table" data={data} columns={columns} emptyState={emptyState} />
  )
}

export const ComplexTable: Story = () => {
  const { Table } = useComponentContext()

  const payrollData: EmployeePayroll[] = [
    {
      employeeId: 'EMP001',
      name: 'Sarah Johnson',
      department: 'Engineering',
      hourlyRate: 45,
      hours: 80,
      status: 'paid',
    },
    {
      employeeId: 'EMP002',
      name: 'Michael Chen',
      department: 'Sales',
      hourlyRate: 35,
      hours: 84,
      status: 'pending',
    },
    {
      employeeId: 'EMP003',
      name: 'Emily Rodriguez',
      department: 'Marketing',
      hourlyRate: 40,
      hours: 76,
      status: 'processing',
    },
    {
      employeeId: 'EMP004',
      name: 'David Kim',
      department: 'Engineering',
      hourlyRate: 43,
      hours: 80,
      status: 'paid',
    },
    {
      employeeId: 'EMP005',
      name: 'Rachel Foster',
      department: 'HR',
      hourlyRate: 38,
      hours: 78,
      status: 'pending',
    },
  ]

  const getStatusBadge = (status: 'paid' | 'pending' | 'processing') => {
    const statusMap = {
      paid: { label: 'Paid', status: 'success' as const },
      pending: { label: 'Pending', status: 'warning' as const },
      processing: { label: 'Processing', status: 'info' as const },
    }
    const { label, status: badgeStatus } = statusMap[status]
    return <Badge status={badgeStatus}>{label}</Badge>
  }

  const calculateGrossPay = (rate: number, hours: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      rate * hours,
    )
  }

  const columns = [
    { key: 'employeeId', title: 'ID', isRowHeader: true },
    { key: 'name', title: 'Employee' },
    {
      key: 'department',
      title: 'Department',
      render: (item: EmployeePayroll) => <span>{item.department}</span>,
    },
    {
      key: 'hourlyRate',
      title: 'Pay Rate',
      render: (item: EmployeePayroll) => <span>${item.hourlyRate.toFixed(2)}/hr</span>,
    },
    { key: 'hours', title: 'Hours' },
    {
      key: 'grossPay',
      title: 'Gross Pay',
      render: (item: EmployeePayroll) => calculateGrossPay(item.hourlyRate, item.hours),
    },
    {
      key: 'status',
      title: 'Status',
      render: (item: EmployeePayroll) => getStatusBadge(item.status),
    },
  ]

  const itemMenu = (item: EmployeePayroll) => (
    <HamburgerMenu
      items={[
        {
          label: 'Edit',
          icon: <PencilSvg aria-hidden />,
          onClick: () => {
            action('Edit clicked')({ item })
          },
        },
        {
          label: 'View Details',
          icon: <PencilSvg aria-hidden />,
          onClick: () => {
            action('View Details clicked')({ item })
          },
        },
        {
          label: 'Delete',
          icon: <TrashCanSvg aria-hidden />,
          onClick: () => {
            action('Delete clicked')({ item })
          },
        },
      ]}
    />
  )

  return (
    <div style={{ maxWidth: '1200px' }}>
      <Table
        aria-label="Employee Payroll"
        data={payrollData}
        columns={columns}
        itemMenu={itemMenu}
      />
    </div>
  )
}
