import { useState } from 'react'
import { fn } from 'storybook/test'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { SelectContractorsPresentation } from './SelectContractorsPresentation'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Contractor.SelectContractors')
  return <>{children}</>
}

export default {
  title: 'Domain/Contractor/SelectContractors',
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

const mockContractors: Contractor[] = [
  {
    uuid: '1',
    isActive: true,
    type: 'Individual',
    firstName: 'Alejandro',
    lastName: 'Kuhic',
    wageType: 'Hourly',
    hourlyRate: '45.00',
  },
  {
    uuid: '2',
    isActive: true,
    type: 'Individual',
    firstName: 'Hannah',
    lastName: 'Arendt',
    wageType: 'Fixed',
  },
  {
    uuid: '3',
    isActive: true,
    type: 'Business',
    businessName: 'Kant Consulting LLC',
    wageType: 'Fixed',
  },
  {
    uuid: '4',
    isActive: true,
    type: 'Individual',
    firstName: 'Isaiah',
    lastName: 'Berlin',
    wageType: 'Hourly',
    hourlyRate: '60.00',
  },
  {
    uuid: '5',
    isActive: true,
    type: 'Business',
    businessName: 'Spektor Studio',
    wageType: 'Fixed',
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

function StoryWrapper({
  initialSelected = new Set<string>(),
  contractors = mockContractors,
  pagination,
  emptyStateTitle,
  emptyStateDescription,
}: {
  initialSelected?: Set<string>
  contractors?: Contractor[]
  pagination?: PaginationControlProps
  emptyStateTitle?: string
  emptyStateDescription?: string
}) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedIds, setSelectedIds] = useState(initialSelected)

  const handleSelect = (contractor: Contractor, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(contractor.uuid)
      else next.delete(contractor.uuid)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(contractors.map(c => c.uuid)) : new Set())
  }

  return (
    <SelectContractorsPresentation
      contractors={contractors}
      selectedIds={selectedIds}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchClear={() => {
        setSearchValue('')
      }}
      onSelect={handleSelect}
      onSelectAll={handleSelectAll}
      pagination={pagination ?? mockPagination}
      isFetching={false}
      emptyStateTitle={emptyStateTitle}
      emptyStateDescription={emptyStateDescription}
    />
  )
}

export const Default = () => <StoryWrapper />

export const PartialSelection = () => <StoryWrapper initialSelected={new Set(['1', '3'])} />

export const AllSelected = () => (
  <StoryWrapper initialSelected={new Set(mockContractors.map(c => c.uuid))} />
)

export const EmptyState = () => <StoryWrapper contractors={[]} />

export const CustomEmptyState = () => (
  <StoryWrapper
    contractors={[]}
    emptyStateTitle="No active contractors"
    emptyStateDescription="Activate at least one contractor before recording a historical payment."
  />
)

export const Fetching = () => (
  <SelectContractorsPresentation
    contractors={mockContractors}
    selectedIds={new Set()}
    searchValue=""
    onSearchChange={fn()}
    onSearchClear={fn()}
    onSelect={fn()}
    onSelectAll={fn()}
    pagination={mockPagination}
    isFetching
  />
)
