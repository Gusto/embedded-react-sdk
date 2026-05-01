import { Suspense, useState } from 'react'
import { fn } from 'storybook/test'
import type { EmployeeTableItem } from '../EmployeeTable/EmployeeTableTypes'
import { PolicyDetailLayout } from './PolicyDetailLayout'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export default {
  title: 'Domain/TimeOff/PolicyDetailLayout',
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
}

const mockEmployees: StoryEmployee[] = [
  { uuid: '1', firstName: 'Alejandro', lastName: 'Kuhic', jobTitle: 'Marketing Director' },
  { uuid: '2', firstName: 'Alexander', lastName: 'Hamilton', jobTitle: 'Engineer' },
  { uuid: '3', firstName: 'Arthur', lastName: 'Schopenhauer', jobTitle: 'Engineer' },
  { uuid: '4', firstName: 'Friedrich', lastName: 'Nietzsche', jobTitle: 'Engineer' },
  { uuid: '5', firstName: 'Hannah', lastName: 'Arendt', jobTitle: 'Account Manager' },
]

const onBack = fn().mockName('onBack')
const onTabChange = fn().mockName('onTabChange')

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

function PlaceholderTabContent() {
  const { Text } = useComponentContext()
  return (
    <Text>
      This is the domain-specific first tab content (e.g. holidays table, policy settings).
    </Text>
  )
}

const closedRemoveDialog = {
  isOpen: false,
  employeeName: '',
  onConfirm: fn().mockName('onRemoveConfirm'),
  onClose: fn().mockName('onRemoveClose'),
  isPending: false,
}

export const FirstTabSelected = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')
  const search = useSearchState()

  return (
    <PolicyDetailLayout<StoryEmployee>
      title="Company PTO"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back to policies"
      firstTab={{
        id: 'details',
        label: 'Details',
        content: <PlaceholderTabContent />,
      }}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: employee => (
          <HamburgerMenu
            items={[
              {
                label: 'Remove',
                icon: <TrashCanSvg aria-hidden />,
                onClick: fn().mockName(`remove-${employee.firstName}`),
              },
            ]}
            triggerLabel={`Actions for ${employee.firstName} ${employee.lastName}`}
          />
        ),
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}

export const EmployeesTabSelected = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()

  return (
    <PolicyDetailLayout<StoryEmployee>
      title="Company PTO"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back to policies"
      firstTab={{
        id: 'details',
        label: 'Details',
        content: <PlaceholderTabContent />,
      }}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: employee => (
          <HamburgerMenu
            items={[
              {
                label: 'Remove',
                icon: <TrashCanSvg aria-hidden />,
                onClick: fn().mockName(`remove-${employee.firstName}`),
              },
            ]}
            triggerLabel={`Actions for ${employee.firstName} ${employee.lastName}`}
          />
        ),
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}

export const WithSuccessAlert = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()

  return (
    <PolicyDetailLayout<StoryEmployee>
      title="Company PTO"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back to policies"
      firstTab={{
        id: 'details',
        label: 'Details',
        content: <PlaceholderTabContent />,
      }}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: employee => (
          <HamburgerMenu
            items={[
              {
                label: 'Remove',
                icon: <TrashCanSvg aria-hidden />,
                onClick: fn().mockName(`remove-${employee.firstName}`),
              },
            ]}
            triggerLabel={`Actions for ${employee.firstName} ${employee.lastName}`}
          />
        ),
      }}
      removeDialog={closedRemoveDialog}
      successAlert="Friedrich Nietzsche has been removed from the policy."
      onDismissAlert={fn().mockName('onDismissAlert')}
    />
  )
}

export const RemoveDialogOpen = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()

  return (
    <PolicyDetailLayout<StoryEmployee>
      title="Company PTO"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back to policies"
      firstTab={{
        id: 'details',
        label: 'Details',
        content: <PlaceholderTabContent />,
      }}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: employee => (
          <HamburgerMenu
            items={[
              {
                label: 'Remove',
                icon: <TrashCanSvg aria-hidden />,
                onClick: fn().mockName(`remove-${employee.firstName}`),
              },
            ]}
            triggerLabel={`Actions for ${employee.firstName} ${employee.lastName}`}
          />
        ),
      }}
      removeDialog={{
        isOpen: true,
        employeeName: 'Friedrich Nietzsche',
        onConfirm: fn().mockName('onRemoveConfirm'),
        onClose: fn().mockName('onRemoveClose'),
        isPending: false,
      }}
    />
  )
}
