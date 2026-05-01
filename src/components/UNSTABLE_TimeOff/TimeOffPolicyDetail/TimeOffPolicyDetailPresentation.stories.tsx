import { Suspense, useState } from 'react'
import { fn } from 'storybook/test'
import { TimeOffPolicyDetailPresentation } from './TimeOffPolicyDetailPresentation'
import type {
  TimeOffPolicyDetailEmployee,
  PolicyDetails,
  PolicySettingsDisplay,
} from './TimeOffPolicyDetailTypes'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import EditIcon from '@/assets/icons/edit-02.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export default {
  title: 'Domain/TimeOff/TimeOffPolicyDetail',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <Story />
      </Suspense>
    ),
  ],
}

const mockLimitedPolicyDetails: PolicyDetails = {
  policyType: 'vacation',
  accrualMethod: 'perHourWorked',
  accrualRate: 2.0,
  accrualRateUnit: 20.0,
  resetDate: 'January 1',
}

const mockUnlimitedPolicyDetails: PolicyDetails = {
  policyType: 'vacation',
  accrualMethod: 'unlimited',
}

const mockSickPolicyDetails: PolicyDetails = {
  policyType: 'sick',
  accrualMethod: 'perCalendarYear',
  accrualRate: 40,
  resetDate: 'January 1',
}

const mockPolicySettings: PolicySettingsDisplay = {
  maxAccrualHoursPerYear: null,
  maxHours: 240,
  carryoverLimitHours: null,
  accrualWaitingPeriodDays: null,
  paidOutOnTermination: true,
}

const mockEmployees: TimeOffPolicyDetailEmployee[] = [
  {
    uuid: '1',
    firstName: 'Alejandro',
    lastName: 'Kuhic',
    jobTitle: 'Marketing Director',
    balance: 80,
  },
  { uuid: '2', firstName: 'Alexander', lastName: 'Hamilton', jobTitle: 'Engineer', balance: 120.5 },
  { uuid: '3', firstName: 'Arthur', lastName: 'Schopenhauer', jobTitle: 'Engineer', balance: 40 },
  { uuid: '4', firstName: 'Friedrich', lastName: 'Nietzsche', jobTitle: 'Engineer', balance: 0 },
  { uuid: '5', firstName: 'Hannah', lastName: 'Arendt', jobTitle: 'Account Manager', balance: 160 },
  {
    uuid: '6',
    firstName: 'Immanuel',
    lastName: 'Kant',
    jobTitle: 'Client Support Manager',
    balance: null,
  },
]

const onBack = fn().mockName('onBack')
const onTabChange = fn().mockName('onTabChange')
const onDismissAlert = fn().mockName('onDismissAlert')
const onRemoveConfirm = fn().mockName('onRemoveConfirm')
const onRemoveClose = fn().mockName('onRemoveClose')
const onChangeSettings = fn().mockName('onChangeSettings')

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

function usePolicyActions() {
  const { Button } = useComponentContext()

  return [
    <Button key="add" variant="secondary" icon={<PlusCircleIcon aria-hidden />} onClick={fn()}>
      Add employees
    </Button>,
    <Button key="edit" variant="secondary" icon={<EditIcon aria-hidden />} onClick={fn()}>
      Edit policy
    </Button>,
  ]
}

const closedRemoveDialog = {
  isOpen: false,
  employeeName: '',
  onConfirm: onRemoveConfirm,
  onClose: onRemoveClose,
  isPending: false,
}

function makeItemMenu(employee: TimeOffPolicyDetailEmployee) {
  return (
    <HamburgerMenu
      items={[
        {
          label: 'Edit balance',
          icon: <EditIcon aria-hidden />,
          onClick: fn().mockName(`edit-balance-${employee.firstName}`),
        },
        {
          label: 'Remove',
          icon: <TrashCanSvg aria-hidden />,
          onClick: fn().mockName(`remove-${employee.firstName}`),
        },
      ]}
      triggerLabel={`Actions for ${employee.firstName} ${employee.lastName}`}
    />
  )
}

export const DetailsTabLimited = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')
  const search = useSearchState()
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Awesome Time Off Policy"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockLimitedPolicyDetails}
      policySettings={mockPolicySettings}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}

export const DetailsTabSick = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')
  const search = useSearchState()
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Sick Leave Policy"
      subtitle="Sick leave"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockSickPolicyDetails}
      policySettings={{
        ...mockPolicySettings,
        maxAccrualHoursPerYear: 100,
        accrualWaitingPeriodDays: 30,
      }}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}

export const DetailsTabUnlimited = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')
  const search = useSearchState()
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Unlimited PTO"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockUnlimitedPolicyDetails}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}

export const EmployeesTab = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Awesome Time Off Policy"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockLimitedPolicyDetails}
      policySettings={mockPolicySettings}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}

export const BulkRemoveSelected = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Awesome Time Off Policy"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockLimitedPolicyDetails}
      policySettings={mockPolicySettings}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: employee => employee.uuid === '1' || employee.uuid === '3',
        footer: () => ({
          name: null,
          jobTitle: null,
          balance: null,
        }),
      }}
      removeDialog={closedRemoveDialog}
      bulkRemoveDialog={{
        isOpen: false,
        count: 2,
        onConfirm: fn().mockName('bulkRemoveConfirm'),
        onClose: fn().mockName('bulkRemoveClose'),
        isPending: false,
      }}
    />
  )
}

export const WithSuccessAlert = () => {
  const [selectedTabId, setSelectedTabId] = useState('employees')
  const search = useSearchState()
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Awesome Time Off Policy"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockLimitedPolicyDetails}
      policySettings={mockPolicySettings}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
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
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Awesome Time Off Policy"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockLimitedPolicyDetails}
      policySettings={mockPolicySettings}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: mockEmployees,
        ...search,
        itemMenu: makeItemMenu,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
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
  const actions = usePolicyActions()

  return (
    <TimeOffPolicyDetailPresentation
      title="Awesome Time Off Policy"
      subtitle="Paid time off policy"
      onBack={onBack}
      backLabel="Back"
      actions={actions}
      policyDetails={mockLimitedPolicyDetails}
      policySettings={mockPolicySettings}
      onChangeSettings={onChangeSettings}
      selectedTabId={selectedTabId}
      onTabChange={id => {
        setSelectedTabId(id)
        onTabChange(id)
      }}
      employees={{
        data: [],
        ...search,
        selectionMode: 'multiple',
        onSelect: fn().mockName('onSelect'),
        getIsItemSelected: () => false,
      }}
      removeDialog={closedRemoveDialog}
    />
  )
}
