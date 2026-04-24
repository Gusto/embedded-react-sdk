import { fn } from 'storybook/test'
import { PolicySettingsPresentation } from './PolicySettingsPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.TimeOff.CreateTimeOffPolicy')
  return <>{children}</>
}

const onContinue = fn().mockName('onContinue')
const onBack = fn().mockName('onBack')

export default {
  title: 'Domain/TimeOff/PolicySettings',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

export const HoursWorkedVariant = () => (
  <PolicySettingsPresentation
    accrualMethod="hours_worked"
    onContinue={onContinue}
    onBack={onBack}
  />
)

export const FixedVariant = () => (
  <PolicySettingsPresentation accrualMethod="fixed" onContinue={onContinue} onBack={onBack} />
)

export const EditMode = () => (
  <PolicySettingsPresentation
    accrualMethod="hours_worked"
    onContinue={onContinue}
    onBack={onBack}
    defaultValues={{
      accrualMaximumEnabled: true,
      accrualMaximum: 100,
      balanceMaximumEnabled: true,
      balanceMaximum: 200,
      carryOverLimitEnabled: true,
      carryOverLimit: 100,
      waitingPeriodEnabled: true,
      waitingPeriod: 30,
      paidOutOnTermination: true,
    }}
  />
)
