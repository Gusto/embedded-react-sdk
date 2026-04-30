import { fn } from 'storybook/test'
import { PolicyTypeSelectorPresentation } from './PolicyTypeSelectorPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.TimeOff.SelectPolicyType')
  return <>{children}</>
}

const onContinue = fn().mockName('onContinue')
const onCancel = fn().mockName('onCancel')

export default {
  title: 'Domain/TimeOff/PolicyTypeSelector',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

export const Default = () => (
  <PolicyTypeSelectorPresentation onContinue={onContinue} onCancel={onCancel} />
)

export const HolidayPaySelected = () => (
  <PolicyTypeSelectorPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultPolicyType="holiday"
  />
)

export const TimeOffSelected = () => (
  <PolicyTypeSelectorPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultPolicyType="vacation"
  />
)

export const SickLeaveSelected = () => (
  <PolicyTypeSelectorPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultPolicyType="sick"
  />
)
