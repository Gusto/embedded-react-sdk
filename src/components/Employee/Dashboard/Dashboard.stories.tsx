import { fn } from 'storybook/test'
import { Dashboard } from './Dashboard'

export default {
  title: 'Domain/Employee/Dashboard',
}

const mockOnEvent = fn().mockName('onEvent')

export const BasicDetails = () => (
  <Dashboard employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const JobAndPay = () => (
  <Dashboard employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const Taxes = () => (
  <Dashboard employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const Documents = () => (
  <Dashboard employeeId="test-employee-456" onEvent={mockOnEvent} />
)
