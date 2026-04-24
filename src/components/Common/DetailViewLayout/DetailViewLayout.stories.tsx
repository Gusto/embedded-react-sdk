import { useState } from 'react'
import { DetailViewLayout } from './DetailViewLayout'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import UserIcon from '@/assets/icons/user-02.svg?react'
import EditIcon from '@/assets/icons/edit-02.svg?react'

export default {
  title: 'Common/DetailViewLayout',
}

function DetailsTabContent() {
  const Components = useComponentContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Components.DescriptionList
        items={[
          { term: 'Type', description: 'Based on hours worked' },
          {
            term: 'Rate',
            description: '1.0 hour(s) for every 10.0 hour(s) worked, including overtime',
          },
          { term: 'Reset date', description: 'January 1' },
        ]}
      />
    </div>
  )
}

function EmployeesTabContent() {
  const Components = useComponentContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Components.Heading as="h3" styledAs="h4">
        3 employees enrolled
      </Components.Heading>
      <Components.Text variant="supporting">
        Employee table content goes here (built in a separate ticket).
      </Components.Text>
    </div>
  )
}

function usePolicyActions() {
  const Components = useComponentContext()

  return (
    <>
      <Components.Button variant="secondary" icon={<UserIcon />}>
        Add employees
      </Components.Button>
      <Components.Button variant="secondary" icon={<EditIcon />}>
        Edit policy
      </Components.Button>
    </>
  )
}

export const Default = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')
  const actions = usePolicyActions()

  const tabs = [
    { id: 'details', label: 'Details', content: <DetailsTabContent /> },
    { id: 'employees', label: 'Employees', content: <EmployeesTabContent /> },
  ]

  return (
    <DetailViewLayout
      title="Company PTO"
      subtitle="Paid time off policy"
      onBack={() => {}}
      backLabel="Time off policies"
      actions={actions}
      tabs={tabs}
      selectedTabId={selectedTabId}
      onTabChange={setSelectedTabId}
    />
  )
}

export const WithoutBackButton = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')
  const actions = usePolicyActions()

  const tabs = [
    { id: 'details', label: 'Details', content: <DetailsTabContent /> },
    { id: 'employees', label: 'Employees', content: <EmployeesTabContent /> },
  ]

  return (
    <DetailViewLayout
      title="Sick Leave"
      subtitle="Sick leave policy"
      actions={actions}
      tabs={tabs}
      selectedTabId={selectedTabId}
      onTabChange={setSelectedTabId}
    />
  )
}

export const WithoutActions = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')

  const tabs = [
    { id: 'details', label: 'Details', content: <DetailsTabContent /> },
    { id: 'employees', label: 'Employees', content: <EmployeesTabContent /> },
  ]

  return (
    <DetailViewLayout
      title="Company PTO"
      subtitle="Paid time off policy"
      onBack={() => {}}
      backLabel="Time off policies"
      tabs={tabs}
      selectedTabId={selectedTabId}
      onTabChange={setSelectedTabId}
    />
  )
}

export const MinimalConfig = () => {
  const Components = useComponentContext()
  const [selectedTabId, setSelectedTabId] = useState('overview')

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <Components.Text>Overview content</Components.Text>,
    },
    {
      id: 'history',
      label: 'History',
      content: <Components.Text>History content</Components.Text>,
    },
  ]

  return (
    <DetailViewLayout
      title="Policy Name"
      tabs={tabs}
      selectedTabId={selectedTabId}
      onTabChange={setSelectedTabId}
    />
  )
}

export const SingleTab = () => {
  const [selectedTabId, setSelectedTabId] = useState('details')

  const tabs = [{ id: 'details', label: 'Details', content: <DetailsTabContent /> }]

  return (
    <DetailViewLayout
      title="Holiday Pay"
      subtitle="Holiday pay policy"
      onBack={() => {}}
      backLabel="Time off policies"
      tabs={tabs}
      selectedTabId={selectedTabId}
      onTabChange={setSelectedTabId}
    />
  )
}
