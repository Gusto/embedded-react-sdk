import { fn } from 'storybook/test'
import { Dashboard } from './Dashboard'

export default {
  title: 'Domain/Employee/Dashboard',
}

const mockOnEvent = fn().mockName('onEvent')

export const BasicDetails = () => (
  <Dashboard companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const JobAndPay = () => (
  <Dashboard companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const Taxes = () => (
  <Dashboard companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const Documents = () => (
  <Dashboard companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)
