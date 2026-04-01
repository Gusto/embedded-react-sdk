import { Suspense, useState } from 'react'
import { fn } from 'storybook/test'
import { EmployeeTable } from './EmployeeTable'
import type { EmployeeTableItem } from './EmployeeTableTypes'
import styles from './EmployeeTable.module.scss'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export default {
  title: 'TimeOff/EmployeeTable',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <Story />
      </Suspense>
    ),
  ],
}

interface StoryEmployee extends EmployeeTableItem {
  uuid: string
  department: string
  balance?: number
}

const mockEmployees: StoryEmployee[] = [
  {
    uuid: '1',
    firstName: 'Alejandro',
    lastName: 'Kuhic',
    jobTitle: 'Marketing Director',
    department: 'Brand & Marketing',
    balance: 40,
  },
  {
    uuid: '2',
    firstName: 'Alexander',
    lastName: 'Hamilton',
    jobTitle: 'Engineer',
    department: 'Product & Engineering',
    balance: 80,
  },
  {
    uuid: '3',
    firstName: 'Arthur',
    lastName: 'Schopenhauer',
    jobTitle: 'Engineer',
    department: 'Product & Engineering',
    balance: 24,
  },
  {
    uuid: '4',
    firstName: 'Friedrich',
    lastName: 'Nietzsche',
    jobTitle: 'Engineer',
    department: 'Product & Engineering',
    balance: 60,
  },
  {
    uuid: '5',
    firstName: 'Hannah',
    lastName: 'Arendt',
    jobTitle: 'Account Manager',
    department: 'Sales',
    balance: 32,
  },
  {
    uuid: '6',
    firstName: 'Immanuel',
    lastName: 'Kant',
    jobTitle: 'Client Support Manager',
    department: 'CX',
    balance: 16,
  },
  {
    uuid: '7',
    firstName: 'Isaiah',
    lastName: 'Berlin',
    jobTitle: 'Client Support Manager',
    department: 'CX',
    balance: 48,
  },
  {
    uuid: '8',
    firstName: 'Patricia',
    lastName: 'Churchland',
    jobTitle: 'Chief Editor',
    department: 'Brand & Marketing',
    balance: 56,
  },
  {
    uuid: '9',
    firstName: 'Regina',
    lastName: 'Spektor',
    jobTitle: 'Account Director',
    department: 'Sales',
    balance: 72,
  },
  {
    uuid: '10',
    firstName: 'Soren',
    lastName: 'Kierkegaard',
    jobTitle: 'Office Administrator',
    department: 'Administration',
    balance: 20,
  },
]

const onSelectAction = fn().mockName('onSelect')

function useSearchState() {
  const [searchValue, setSearchValue] = useState('')
  return {
    searchValue,
    onSearchChange: setSearchValue,
    onSearchClear: () => {
      setSearchValue('')
    },
  }
}

export const SelectEmployees = () => {
  const search = useSearchState()
  const [selected, setSelected] = useState(new Set())

  return (
    <EmployeeTable<StoryEmployee>
      data={mockEmployees}
      {...search}
      selectionMode="multiple"
      onSelect={(item, checked) => {
        onSelectAction(item, checked)
        setSelected(prev => {
          const next = new Set(prev)
          if (checked) next.add(item.uuid)
          else next.delete(item.uuid)
          return next
        })
      }}
      isItemSelected={item => selected.has(item.uuid)}
      additionalColumns={[{ key: 'department' as keyof StoryEmployee, title: 'Department' }]}
    />
  )
}

const BalanceInput = ({ employee }: { employee: StoryEmployee }) => {
  const Components = useComponentContext()
  const [value, setValue] = useState(employee.balance?.toString() ?? '')
  return (
    <div className={styles.balanceInput}>
      <Components.TextInput
        name={`balance-${employee.uuid}`}
        label="Balance"
        shouldVisuallyHideLabel
        value={value}
        onChange={setValue}
        placeholder="0"
      />
    </div>
  )
}

export const SetBalances = () => {
  const search = useSearchState()

  return (
    <EmployeeTable<StoryEmployee>
      data={mockEmployees}
      {...search}
      additionalColumns={[
        {
          key: 'balance' as keyof StoryEmployee,
          title: 'Balance (hrs)',
          render: employee => <BalanceInput employee={employee} />,
        },
      ]}
    />
  )
}

export const PTOEmployeesTab = () => {
  const search = useSearchState()

  return (
    <EmployeeTable<StoryEmployee>
      data={mockEmployees}
      {...search}
      additionalColumns={[
        {
          key: 'balance' as keyof StoryEmployee,
          title: 'Balance (hrs)',
          render: employee => `${employee.balance ?? 0}`,
        },
      ]}
      itemMenu={employee => (
        <HamburgerMenu
          items={[
            { label: 'Edit balance', icon: <PencilSvg aria-hidden />, onClick: () => {} },
            { label: 'Remove', icon: <TrashCanSvg aria-hidden />, onClick: () => {} },
          ]}
          triggerLabel={`Actions for ${employee.firstName}`}
        />
      )}
    />
  )
}

export const HolidayEmployeesTab = () => {
  const search = useSearchState()

  return (
    <EmployeeTable<StoryEmployee>
      data={mockEmployees}
      {...search}
      additionalColumns={[{ key: 'department' as keyof StoryEmployee, title: 'Department' }]}
      itemMenu={employee => (
        <HamburgerMenu
          items={[{ label: 'Remove', icon: <TrashCanSvg aria-hidden />, onClick: () => {} }]}
          triggerLabel={`Actions for ${employee.firstName}`}
        />
      )}
    />
  )
}

export const EmptyState = () => {
  const search = useSearchState()

  return (
    <EmployeeTable<StoryEmployee>
      data={[]}
      {...search}
      emptyState={() => (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No employees have been added to this policy yet.
        </div>
      )}
    />
  )
}

export const EmptySearchState = () => {
  return (
    <EmployeeTable<StoryEmployee>
      data={[]}
      searchValue="nonexistent"
      onSearchChange={() => {}}
      onSearchClear={() => {}}
      emptySearchState={() => (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No employees match your search. Try a different name.
        </div>
      )}
    />
  )
}

export const WithPagination = () => {
  const search = useSearchState()

  return (
    <EmployeeTable<StoryEmployee>
      data={mockEmployees}
      {...search}
      additionalColumns={[{ key: 'department' as keyof StoryEmployee, title: 'Department' }]}
      pagination={{
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        itemsPerPage: 10,
        handleFirstPage: () => {},
        handlePreviousPage: () => {},
        handleNextPage: () => {},
        handleLastPage: () => {},
        handleItemsPerPageChange: () => {},
      }}
    />
  )
}

export const Loading = () => {
  const search = useSearchState()

  return (
    <EmployeeTable<StoryEmployee>
      data={mockEmployees}
      {...search}
      isFetching
      additionalColumns={[{ key: 'department' as keyof StoryEmployee, title: 'Department' }]}
      pagination={{
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        itemsPerPage: 10,
        handleFirstPage: () => {},
        handlePreviousPage: () => {},
        handleNextPage: () => {},
        handleLastPage: () => {},
        handleItemsPerPageChange: () => {},
      }}
    />
  )
}
