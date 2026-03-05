import { fn } from 'storybook/test'
import type { ApiPayrollBlocker } from '../payrollHelpers'
import { PayrollBlockerAlerts } from './PayrollBlockerAlerts'

const mockBlockers: ApiPayrollBlocker[] = [
  {
    key: 'missing_signatory',
    message:
      'A signatory who is authorized to sign documents on behalf of your company is required.',
  },
  {
    key: 'suspended',
    message: 'Company is suspended and cannot run payroll.',
  },
  {
    key: 'missing_bank_info',
    message: 'Company bank account must be verified in order to run payroll.',
  },
]

export default {
  title: 'Domain/Payroll/PayrollBlocker/Alerts',
}

const viewBlockersClickAction = fn().mockName('onViewBlockersClick')

export const SingleBlocker = () => {
  return (
    <PayrollBlockerAlerts
      blockers={mockBlockers.slice(0, 1)}
      onViewBlockersClick={viewBlockersClickAction}
    />
  )
}

export const SingleActionableBlocker = () => {
  const actionableBlocker: ApiPayrollBlocker = {
    key: 'pending_information_request',
    message:
      'Company has an open information request that must be submitted and approved in order to unblock payroll.',
  }

  return (
    <PayrollBlockerAlerts
      blockers={[actionableBlocker]}
      onViewBlockersClick={viewBlockersClickAction}
    />
  )
}

export const MultipleBlockers = () => {
  return (
    <PayrollBlockerAlerts blockers={mockBlockers} onViewBlockersClick={viewBlockersClickAction} />
  )
}

export const MultipleBlockersWithoutLink = () => {
  return <PayrollBlockerAlerts blockers={mockBlockers} />
}

export const MultipleBlockersCustomLabel = () => {
  return (
    <PayrollBlockerAlerts
      blockers={mockBlockers}
      onViewBlockersClick={viewBlockersClickAction}
      viewBlockersLabel="See all issues"
    />
  )
}

export const EmptyBlockers = () => {
  return <PayrollBlockerAlerts blockers={[]} />
}

export const WithDifferentContent = () => {
  const customBlocker: ApiPayrollBlocker = {
    ...mockBlockers[0]!,
    key: 'custom_blocker',
    message: 'Bank account verification required',
  }

  return (
    <PayrollBlockerAlerts
      blockers={[customBlocker]}
      onViewBlockersClick={viewBlockersClickAction}
    />
  )
}
