import { fn } from 'storybook/test'
import { DashboardView } from './DashboardView'

export default {
  title: 'Domain/Employee/Dashboard',
}

const mockOnEvent = fn().mockName('onEvent')

export const BasicDetails = () => (
  <DashboardView companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const JobAndPay = () => (
  <DashboardView companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const Taxes = () => (
  <DashboardView companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)

export const Documents = () => (
  <DashboardView companyId="test-company-123" employeeId="test-employee-456" onEvent={mockOnEvent} />
)
