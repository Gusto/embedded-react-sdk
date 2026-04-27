import { useState } from 'react'
import { fn } from 'storybook/test'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.TimeOff.SelectEmployees')
  return <>{children}</>
}

export default {
  title: 'Domain/TimeOff/SelectEmployees',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <div style={{ width: '100%', minWidth: '640px' }}>
          <Story />
        </div>
      </I18nLoader>
    ),
  ],
}

const mockEmployees: EmployeeItem[] = [
  {
    uuid: '1',
    firstName: 'Alejandro',
    lastName: 'Kuhic',
    jobTitle: 'Marketing Director',
    department: 'Brand & Marketing',
  },
  {
    uuid: '2',
    firstName: 'Alexander',
    lastName: 'Hamilton',
    jobTitle: 'Engineer',
    department: 'Product & Engineering',
  },
  {
    uuid: '3',
    firstName: 'Arthur',
    lastName: 'Schopenhauer',
    jobTitle: 'Engineer',
    department: 'Product & Engineering',
  },
  {
    uuid: '4',
    firstName: 'Friedrich',
    lastName: 'Nietzsche',
    jobTitle: 'Engineer',
    department: 'Product & Engineering',
  },
  {
    uuid: '5',
    firstName: 'Hannah',
    lastName: 'Arendt',
    jobTitle: 'Account Manager',
    department: 'Sales',
  },
  {
    uuid: '6',
    firstName: 'Immanuel',
    lastName: 'Kant',
    jobTitle: 'Client Support Manager',
    department: 'CX',
  },
  {
    uuid: '7',
    firstName: 'Isaiah',
    lastName: 'Berlin',
    jobTitle: 'Client Support Manager',
    department: 'CX',
  },
  {
    uuid: '8',
    firstName: 'Patricia',
    lastName: 'Churchland',
    jobTitle: 'Chief Editor',
    department: 'Brand & Marketing',
  },
  {
    uuid: '9',
    firstName: 'Regina',
    lastName: 'Spektor',
    jobTitle: 'Account Director',
    department: 'Sales',
  },
  {
    uuid: '10',
    firstName: 'Soren',
    lastName: 'Kierkegaard',
    jobTitle: 'Office Administrator',
    department: 'Administration',
  },
]

const mockPagination: PaginationControlProps = {
  currentPage: 1,
  totalPages: 10,
  totalCount: 100,
  itemsPerPage: 10,
  handleFirstPage: fn().mockName('handleFirstPage'),
  handlePreviousPage: fn().mockName('handlePreviousPage'),
  handleNextPage: fn().mockName('handleNextPage'),
  handleLastPage: fn().mockName('handleLastPage'),
  handleItemsPerPageChange: fn().mockName('handleItemsPerPageChange'),
}

const onBack = fn().mockName('onBack')
const onContinue = fn().mockName('onContinue')

function StoryWrapper({
  initialSelected = new Set<string>(),
  showReassignmentWarning = false,
  employees = mockEmployees,
  pagination,
}: {
  initialSelected?: Set<string>
  showReassignmentWarning?: boolean
  employees?: EmployeeItem[]
  pagination?: PaginationControlProps
}) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedUuids, setSelectedUuids] = useState(initialSelected)
  const [balances, setBalances] = useState<Record<string, string>>({})

  const handleSelect = (item: EmployeeItem, checked: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (checked) next.add(item.uuid)
      else next.delete(item.uuid)
      return next
    })
  }

  const handleBalanceChange = (uuid: string, value: string) => {
    setBalances(prev => ({ ...prev, [uuid]: value }))
  }

  return (
    <SelectEmployeesPresentation
      employees={employees}
      selectedUuids={selectedUuids}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchClear={() => { setSearchValue(''); }}
      onSelect={handleSelect}
      onBack={onBack}
      onContinue={onContinue}
      showReassignmentWarning={showReassignmentWarning}
      balances={balances}
      onBalanceChange={handleBalanceChange}
      pagination={pagination}
    />
  )
}

export const Default = () => <StoryWrapper />

export const PartialSelection = () => <StoryWrapper initialSelected={new Set(['1', '3', '5'])} />

export const AllSelected = () => (
  <StoryWrapper initialSelected={new Set(mockEmployees.map(e => e.uuid))} />
)

export const WithReassignmentWarning = () => <StoryWrapper showReassignmentWarning />

export const WithoutReassignmentWarning = () => <StoryWrapper />

export const WithPagination = () => (
  <StoryWrapper initialSelected={new Set(['1', '4', '6'])} pagination={mockPagination} />
)

export const SearchFiltered = () => {
  const [searchValue, setSearchValue] = useState('alex')
  const filtered = mockEmployees.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchValue.toLowerCase()),
  )

  return (
    <SelectEmployeesPresentation
      employees={filtered}
      selectedUuids={new Set(['1'])}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchClear={() => { setSearchValue(''); }}
      onSelect={fn()}
      onBack={onBack}
      onContinue={onContinue}
      showReassignmentWarning={false}
      balances={{}}
      onBalanceChange={fn()}
    />
  )
}

export const EmptySearchResults = () => (
  <SelectEmployeesPresentation
    employees={[]}
    selectedUuids={new Set()}
    searchValue="nonexistent employee"
    onSearchChange={fn()}
    onSearchClear={fn()}
    onSelect={fn()}
    onBack={onBack}
    onContinue={onContinue}
    showReassignmentWarning={false}
    balances={{}}
    onBalanceChange={fn()}
  />
)
