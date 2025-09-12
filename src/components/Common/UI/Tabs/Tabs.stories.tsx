import type { Story } from '@ladle/react'
import { action } from '@ladle/react'
import { useLadleState } from '../../../../../.ladle/helpers/LadleState'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Tabs',
  args: {},
}

export const Default: Story = () => {
  const Components = useComponentContext()
  const { value: selectedId, handleChange: setSelectedId } = useLadleState<string>(
    'DefaultTabSelection',
    'overview',
  )

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Overview
          </Components.Heading>
          <Components.Text>Welcome to your dashboard overview.</Components.Text>
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Analytics
          </Components.Heading>
          <Components.Text>View your performance metrics and insights.</Components.Text>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Settings
          </Components.Heading>
          <Components.Text>Configure your account preferences.</Components.Text>
        </div>
      ),
    },
  ]

  return (
    <Components.Tabs
      tabs={tabs}
      selectedId={selectedId}
      onSelectionChange={setSelectedId}
      aria-label="Dashboard navigation"
    />
  )
}

export const Controlled: Story = () => {
  const Components = useComponentContext()
  const { value: selectedId, handleChange: setSelectedId } = useLadleState<string>(
    'TabSelection',
    'dashboard',
  )

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Dashboard
          </Components.Heading>
          <Components.Text>System overview and key metrics.</Components.Text>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Settings
          </Components.Heading>
          <Components.Text>Configure your preferences.</Components.Text>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Components.Text size="sm" variant="supporting">
        Current tab: {selectedId}
      </Components.Text>
      <Components.Tabs
        tabs={tabs}
        selectedId={selectedId}
        onSelectionChange={setSelectedId}
        aria-label="Admin panel"
      />
    </div>
  )
}

export const Disabled: Story = () => {
  const Components = useComponentContext()
  const { value: selectedId, handleChange: setSelectedId } = useLadleState<string>(
    'DisabledTabSelection',
    'active',
  )

  const tabs = [
    {
      id: 'active',
      label: 'Active',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Active Projects
          </Components.Heading>
          <Components.Text>Currently running projects.</Components.Text>
        </div>
      ),
    },
    {
      id: 'pending',
      label: 'Pending',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Pending Projects
          </Components.Heading>
          <Components.Text>Projects waiting for approval.</Components.Text>
        </div>
      ),
    },
    {
      id: 'archived',
      label: 'Archived',
      content: (
        <div>
          <Components.Heading as="h2" styledAs="h4">
            Archived
          </Components.Heading>
          <Components.Text>This tab is disabled.</Components.Text>
        </div>
      ),
      isDisabled: true,
    },
  ]

  const handleSelectionChange = (id: string) => {
    setSelectedId(id)
    action('Tab Selected')(id)
  }

  return (
    <Components.Tabs
      tabs={tabs}
      selectedId={selectedId}
      onSelectionChange={handleSelectionChange}
      aria-label="Project tabs"
    />
  )
}

export const ComplexContent: Story = () => {
  const Components = useComponentContext()
  const { value: selectedId, handleChange: setSelectedId } = useLadleState<string>(
    'ComplexTabSelection',
    'upcoming',
  )

  const employees = [
    { name: 'Sarah Johnson', role: 'Engineering Manager', hours: 80, pay: '$3,600' },
    { name: 'Michael Chen', role: 'Software Engineer', hours: 84, pay: '$2,940' },
  ]

  const tabs = [
    {
      id: 'upcoming',
      label: 'Upcoming payroll',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Components.Heading as="h2" styledAs="h4">
              Upcoming Payroll
            </Components.Heading>
            <Components.Text variant="supporting">
              Pay period: Jul 30 - Aug 13, 2025
            </Components.Text>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Components.Button>Run payroll</Components.Button>
            <Components.Button variant="secondary">Preview</Components.Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {employees.map((employee, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  border: '1px solid var(--g-colorBorder)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <Components.Text weight="medium">{employee.name}</Components.Text>
                  <Components.Text size="sm" variant="supporting">
                    {employee.role}
                  </Components.Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Components.Text>{employee.hours}h</Components.Text>
                  <Components.Text size="sm" weight="medium">
                    {employee.pay}
                  </Components.Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'history',
      label: 'History',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Components.Heading as="h2" styledAs="h4">
            Payroll History
          </Components.Heading>
          <div
            style={{
              padding: '12px',
              border: '1px solid var(--g-colorBorder)',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Components.Text weight="medium">Jul 15 - Jul 29, 2025</Components.Text>
              <Components.Text size="sm" variant="supporting">
                Completed • 2 employees
              </Components.Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Components.Badge status="success">Paid</Components.Badge>
              <Components.Text weight="medium">$6,540</Components.Text>
            </div>
          </div>
          <Components.Button variant="tertiary">View all history</Components.Button>
        </div>
      ),
    },
  ]

  return (
    <Components.Tabs
      tabs={tabs}
      selectedId={selectedId}
      onSelectionChange={setSelectedId}
      aria-label="Payroll tabs"
    />
  )
}
