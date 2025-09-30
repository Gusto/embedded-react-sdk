import { action } from '@ladle/react'
import { I18nWrapper } from '../../../../.ladle/helpers/I18nWrapper'
import { PayrollBlockerAlerts } from './PayrollBlockerAlerts'
import type { PayrollBlocker } from './PayrollBlockerTypes'

const mockBlockers: PayrollBlocker[] = [
  {
    id: 'signatory_required',
    title: 'A signatory who is authorized to sign documents on behalf of your company is required.',
    description: 'Confirm that the company has a signatory.',
    status: 'unresolved',
    estimatedResolutionTime: '5 minutes',
    category: 'Company Setup',
    action: {
      label: 'Set Up Signatory',
      onClick: action('Set up signatory'),
    },
  },
  {
    id: 'company_suspended',
    title: 'Company is suspended and cannot run payroll.',
    description: 'Contact support if you think this is not accurate.',
    status: 'unresolved',
    estimatedResolutionTime: '1-2 business days',
    category: 'Account Status',
    action: {
      label: 'Contact Support',
      onClick: action('Contact support'),
    },
  },
  {
    id: 'bank_verification',
    title: 'Company bank account must be verified in order to run payroll.',
    description:
      'Missing company onboarding requirement. Confirm that the company bank account has been verified.',
    status: 'unresolved',
    estimatedResolutionTime: '1-2 business days',
    category: 'Banking',
    action: {
      label: 'Verify Account',
      onClick: action('Verify account'),
    },
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
  const customBlocker = {
    ...mockBlockers[0],
    id: 'custom_blocker',
    title: 'Bank account verification required',
    description: 'Verify your bank account to process payroll.',
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
