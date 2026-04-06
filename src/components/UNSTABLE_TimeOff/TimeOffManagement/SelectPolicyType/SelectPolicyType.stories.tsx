import { fn } from 'storybook/test'
import { SelectPolicyTypePresentation } from './SelectPolicyTypePresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.TimeOff.SelectPolicyType')
  return <>{children}</>
}

const onContinue = fn().mockName('onContinue')
const onCancel = fn().mockName('onCancel')

export default {
  title: 'TimeOff/SelectPolicyType',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

export const Default = () => (
  <SelectPolicyTypePresentation onContinue={onContinue} onCancel={onCancel} />
)

export const HolidayPaySelected = () => (
  <SelectPolicyTypePresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultPolicyType="holiday"
  />
)

export const TimeOffSelected = () => (
  <SelectPolicyTypePresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultPolicyType="vacation"
  />
)

export const SickLeaveSelected = () => (
  <SelectPolicyTypePresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultPolicyType="sick"
  />
)
