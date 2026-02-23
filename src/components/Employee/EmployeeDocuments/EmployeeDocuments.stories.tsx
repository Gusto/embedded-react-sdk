import { fn } from 'storybook/test'
import { EmployeeDocuments } from './EmployeeDocuments'
import { ApiProvider } from '@/contexts/ApiProvider'

export default {
  title: 'Domain/Employee/EmployeeDocuments',
  decorators: [
    (Story: React.ComponentType) => (
      <ApiProvider url="https://api.gusto-demo.com" headers={{ Authorization: 'Bearer token' }}>
        <Story />
      </ApiProvider>
    ),
  ],
}

const mockEmployeeId = 'employee_id'
const handleEvent = fn().mockName('onEvent')

export const SelfOnboardingWithI9Unchecked = () => (
  <EmployeeDocuments employeeId={mockEmployeeId} isSelfOnboarding={true} onEvent={handleEvent} />
)

export const SelfOnboardingWithI9Checked = () => (
  <EmployeeDocuments employeeId={mockEmployeeId} isSelfOnboarding={true} onEvent={handleEvent} />
)

export const NotSelfOnboarding = () => (
  <EmployeeDocuments employeeId={mockEmployeeId} isSelfOnboarding={false} onEvent={handleEvent} />
)
