import { Suspense, useState } from 'react'
import { fn } from 'storybook/test'
import type { HolidayItem } from '../HolidaySelectionForm/HolidaySelectionFormTypes'
import { HolidayPolicyDetailPresentation } from './HolidayPolicyDetailPresentation'
import type { HolidayPolicyDetailEmployee } from './HolidayPolicyDetailTypes'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import EditIcon from '@/assets/icons/edit-02.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export default {
  title: 'TimeOff/HolidayPolicyDetail',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <Story />
      </Suspense>
    ),
  ],
}

const mockHolidays: HolidayItem[] = [
  {
    uuid: 'newYearsDay',
    name: "New Year's Day",
    observedDate: 'January 1',
    nextObservation: 'January 1, 2027',
  },
  {
    uuid: 'mlkDay',
    name: 'Martin Luther King, Jr. Day',
    observedDate: 'Third Monday in January',
    nextObservation: 'January 18, 2027',
  },
  {
    uuid: 'presidentsDay',
    name: "Presidents' Day",
    observedDate: 'Third Monday in February',
    nextObservation: 'February 15, 2027',
  },
  {
    uuid: 'memorialDay',
    name: 'Memorial Day',
    observedDate: 'Last Monday in May',
    nextObservation: 'May 31, 2027',
  },
  {
    uuid: 'juneteenth',
    name: 'Juneteenth',
    observedDate: 'June 19',
    nextObservation: 'June 19, 2026',
  },
  {
    uuid: 'independenceDay',
    name: 'Independence Day',
    observedDate: 'July 4',
    nextObservation: 'July 4, 2026',
  },
  {
    uuid: 'laborDay',
    name: 'Labor Day',
    observedDate: 'First Monday in September',
    nextObservation: 'September 7, 2026',
  },
  {
    uuid: 'columbusDay',
    name: "Columbus Day (Indigenous Peoples' Day)",
    observedDate: 'Second Monday in October',
    nextObservation: 'October 12, 2026',
  },
  {
    uuid: 'veteransDay',
    name: 'Veterans Day',
    observedDate: 'November 11',
    nextObservation: 'November 11, 2026',
  },
  {
    uuid: 'thanksgiving',
    name: 'Thanksgiving',
    observedDate: 'Fourth Thursday in November',
    nextObservation: 'November 26, 2026',
  },
  {
    uuid: 'christmasDay',
    name: 'Christmas Day',
    observedDate: 'December 25',
    nextObservation: 'December 25, 2026',
  },
]

const mockEmployees: HolidayPolicyDetailEmployee[] = [
  { uuid: '1', firstName: 'Alejandro', lastName: 'Kuhic', jobTitle: 'Marketing Director' },
  { uuid: '2', firstName: 'Alexander', lastName: 'Hamilton', jobTitle: 'Engineer' },
  { uuid: '3', firstName: 'Arthur', lastName: 'Schopenhauer', jobTitle: 'Engineer' },
  { uuid: '4', firstName: 'Friedrich', lastName: 'Nietzsche', jobTitle: 'Engineer' },
  { uuid: '5', firstName: 'Hannah', lastName: 'Arendt', jobTitle: 'Account Manager' },
  { uuid: '6', firstName: 'Immanuel', lastName: 'Kant', jobTitle: 'Client Support Manager' },
]

const onBack = fn().mockName('onBack')
const onTabChange = fn().mockName('onTabChange')
const onDismissAlert = fn().mockName('onDismissAlert')
const onRemoveConfirm = fn().mockName('onRemoveConfirm')
const onRemoveClose = fn().mockName('onRemoveClose')

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

function PolicyActions() {
  const { Button } = useComponentContext()

  return (
    <>
      <Button variant="secondary" icon={<PlusCircleIcon aria-hidden />} onClick={fn()}>
        Add employees
      </Button>
      <Button variant="secondary" icon={<EditIcon aria-hidden />} onClick={fn()}>
        Edit policy
      </Button>
    </>
  )
}

const closedRemoveDialog = {
  isOpen: false,
  employeeName: '',
  onConfirm: onRemoveConfirm,
  onClose: onRemoveClose,
  isPending: false,
}

export const HolidaysTab = () => {
  const [selectedTabId, setSelectedTabId] = useState('holidays')
  const search = useSearchState()

  return (
    <HolidayPolicyDetailPresentation
      title="Holiday pay policy"
      onBack={onBack}
      backLabel="Back to policies"
      actions={<PolicyActions />}
      holidays={mockHolidays}
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

export const EmployeesTab = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()

  return (
    <HolidayPolicyDetailPresentation
      title="Holiday pay policy"
      onBack={onBack}
      backLabel="Back to policies"
      actions={<PolicyActions />}
      holidays={mockHolidays}
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
    <HolidayPolicyDetailPresentation
      title="Holiday pay policy"
      onBack={onBack}
      backLabel="Back to policies"
      actions={<PolicyActions />}
      holidays={mockHolidays}
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
      successAlert="Alejandro Kuhic has been removed from the policy."
      onDismissAlert={onDismissAlert}
    />
  )
}

export const RemoveDialogOpen = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()

  return (
    <HolidayPolicyDetailPresentation
      title="Holiday pay policy"
      onBack={onBack}
      backLabel="Back to policies"
      actions={<PolicyActions />}
      holidays={mockHolidays}
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
        employeeName: 'Alejandro Kuhic',
        onConfirm: onRemoveConfirm,
        onClose: onRemoveClose,
        isPending: false,
      }}
    />
  )
}

export const EmptyEmployees = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()

  return (
    <HolidayPolicyDetailPresentation
      title="Holiday pay policy"
      onBack={onBack}
      backLabel="Back to policies"
      actions={<PolicyActions />}
      holidays={mockHolidays}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: [],
        ...search,
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}
