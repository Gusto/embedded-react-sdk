import { fn } from '@storybook/test'
import { PayrollBlockerList, type PayrollBlocker } from './PayrollBlockerList'

const mockBlockers: PayrollBlocker[] = [
  {
    id: 'signatory_required',
    title: 'A signatory who is authorized to sign documents on behalf of your company is required.',
    description: 'Confirm that the company has a signatory.',
    action: {
      label: 'Set Up Signatory',
      onClick: fn().mockName('Set up signatory'),
    },
  },
  {
    id: 'company_suspended',
    title: 'Company is suspended and cannot run payroll.',
    description: 'Contact support if you think this is not accurate.',
    action: {
      label: 'Contact Support',
      onClick: fn().mockName('Contact support'),
    },
  },
]

export default {
  title: 'Domain/Payroll/PayrollBlocker/List',
}

export const MultipleBlockers = () => {
  return <PayrollBlockerList blockers={mockBlockers} />
}

export const SingleBlocker = () => {
  return <PayrollBlockerList blockers={mockBlockers.slice(0, 1)} />
}

export const BlockersWithoutActions = () => {
  const blockersWithoutActions = mockBlockers.map(blocker => ({
    ...blocker,
    action: undefined,
    quickAction: undefined,
  }))

  return <PayrollBlockerList blockers={blockersWithoutActions} />
}

export const EmptyList = () => {
  return <PayrollBlockerList blockers={[]} />
}

export const MixedActionTypes = () => {
  const quickActionBlocker: PayrollBlocker = {
    ...mockBlockers[1]!,
    id: 'quick_action_blocker',
  }

  const legacyActionBlocker: PayrollBlocker = {
    ...mockBlockers[0]!,
    id: 'legacy_action',
    title: 'Legacy action blocker',
    description: 'This blocker uses the legacy action format.',
    action: {
      label: 'Legacy Action',
      onClick: fn().mockName('Legacy action'),
    },
  }

  const mixedBlockers: PayrollBlocker[] = [
    mockBlockers[0]!,
    quickActionBlocker,
    legacyActionBlocker,
  ]

  return <PayrollBlockerList blockers={mixedBlockers} />
}
