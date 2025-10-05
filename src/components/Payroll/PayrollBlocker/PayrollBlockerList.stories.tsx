import { action } from '@ladle/react'
import { I18nWrapper } from '../../../../.ladle/helpers/I18nWrapper'
import { PayrollBlockerList } from './PayrollBlockerList'

interface PayrollBlocker {
  id: string
  title: string
  description: string
  status: string
  estimatedResolutionTime: string
  category: string
  resolutionSteps: Array<{
    id: string
    title: string
    description: string
    externalLink: {
      url: string
      label: string
      opensInNewTab: boolean
    }
  }>
  action?: {
    label: string
    onClick: () => void
  }
  quickAction?: {
    label: string
    onClick: () => void
  }
}

const mockBlockers: PayrollBlocker[] = [
  {
    id: 'signatory_required',
    title: 'A signatory who is authorized to sign documents on behalf of your company is required.',
    description: 'Confirm that the company has a signatory.',
    status: 'unresolved',
    estimatedResolutionTime: '5 minutes',
    category: 'Company Setup',
    resolutionSteps: [
      {
        id: 'signatory_step_1',
        title: 'Set up company signatory',
        description: 'Navigate to company settings to designate an authorized signatory.',
        externalLink: {
          url: 'https://app.gusto.com/company/signatory',
          label: 'Set Up Signatory',
          opensInNewTab: true,
        },
      },
    ],
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
    resolutionSteps: [
      {
        id: 'suspended_step_1',
        title: 'Contact Gusto Support',
        description: 'Get help resolving your account suspension.',
        externalLink: {
          url: 'https://support.gusto.com/contact',
          label: 'Contact Support',
          opensInNewTab: true,
        },
      },
    ],
    action: {
      label: 'Contact Support',
      onClick: action('Contact support'),
    },
  },
]

export default {
  title: 'Domain/Payroll/PayrollBlocker/List',
}

export const MultipleBlockers = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerList blockers={mockBlockers} />
    </I18nWrapper>
  )
}

export const SingleBlocker = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerList blockers={mockBlockers.slice(0, 1)} />
    </I18nWrapper>
  )
}

export const BlockersWithoutActions = () => {
  const blockersWithoutActions = mockBlockers.map(blocker => ({
    ...blocker,
    action: undefined,
    quickAction: undefined,
    resolutionSteps: [],
  }))

  return (
    <I18nWrapper>
      <PayrollBlockerList blockers={blockersWithoutActions} />
    </I18nWrapper>
  )
}

export const EmptyList = () => {
  return (
    <I18nWrapper>
      <PayrollBlockerList blockers={[]} />
    </I18nWrapper>
  )
}

export const MixedActionTypes = () => {
  const quickActionBlocker: PayrollBlocker = {
    ...mockBlockers[1]!,
    id: 'quick_action_blocker',
    resolutionSteps: [],
    quickAction: {
      label: 'Quick Fix',
      onClick: action('Quick action'),
    },
  }

  const legacyActionBlocker: PayrollBlocker = {
    ...mockBlockers[0]!,
    id: 'legacy_action',
    title: 'Legacy action blocker',
    description: 'This blocker uses the legacy action format.',
    resolutionSteps: [],
    quickAction: undefined,
    action: {
      label: 'Legacy Action',
      onClick: action('Legacy action'),
    },
  }

  const mixedBlockers: PayrollBlocker[] = [
    mockBlockers[0]!, // Has resolutionSteps
    quickActionBlocker,
    legacyActionBlocker,
  ]

  return (
    <I18nWrapper>
      <PayrollBlockerList blockers={mixedBlockers} />
    </I18nWrapper>
  )
}
