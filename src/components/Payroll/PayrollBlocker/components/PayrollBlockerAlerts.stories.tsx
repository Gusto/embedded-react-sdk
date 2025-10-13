import { action } from '@ladle/react'
import { I18nWrapper } from '../../../../../.ladle/helpers/I18nWrapper'
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

export const SingleBlocker = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerAlerts
        blockers={mockBlockers.slice(0, 1)}
        onMultipleViewClick={action('onMultipleViewClick')}
      />
    </I18nWrapper>
  )
}

export const MultipleBlockers = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerAlerts
        blockers={mockBlockers}
        onMultipleViewClick={action('onMultipleViewClick')}
      />
    </I18nWrapper>
  )
}

export const MultipleBlockersWithoutLink = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerAlerts blockers={mockBlockers} />
    </I18nWrapper>
  )
}

export const MultipleBlockersCustomLabel = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerAlerts
        blockers={mockBlockers}
        onMultipleViewClick={action('onMultipleViewClick')}
        multipleViewLabel="See all issues"
      />
    </I18nWrapper>
  )
}

export const EmptyBlockers = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerAlerts blockers={[]} />
    </I18nWrapper>
  )
}

export const WithDifferentContent = () => {
  const customBlocker: ApiPayrollBlocker = {
    ...mockBlockers[0]!,
    key: 'custom_blocker',
    message: 'Bank account verification required',
  }

  return (
    <I18nWrapper>
      <PayrollBlockerAlerts
        blockers={[customBlocker]}
        onMultipleViewClick={action('onMultipleViewClick')}
      />
    </I18nWrapper>
  )
}
