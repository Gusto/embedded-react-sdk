import { action } from '@ladle/react'
import { I18nWrapper } from '../../../../../.ladle/helpers/I18nWrapper'
import { PayrollBlockerList, type PayrollBlocker } from './PayrollBlockerList'

const mockBlockers: PayrollBlocker[] = [
  {
    id: 'signatory_required',
    title: 'A signatory who is authorized to sign documents on behalf of your company is required.',
    description: 'Confirm that the company has a signatory.',
    action: {
      label: 'Set Up Signatory',
      onClick: action('Set up signatory'),
    },
  },
  {
    id: 'company_suspended',
    title: 'Company is suspended and cannot run payroll.',
    description: 'Contact support if you think this is not accurate.',
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
  }

  const legacyActionBlocker: PayrollBlocker = {
    ...mockBlockers[0]!,
    id: 'legacy_action',
    title: 'Legacy action blocker',
    description: 'This blocker uses the legacy action format.',
    action: {
      label: 'Legacy Action',
      onClick: action('Legacy action'),
    },
  }

  const mixedBlockers: PayrollBlocker[] = [
    mockBlockers[0]!,
    quickActionBlocker,
    legacyActionBlocker,
  ]

  return (
    <I18nWrapper>
      <PayrollBlockerList blockers={mixedBlockers} />
    </I18nWrapper>
  )
}
