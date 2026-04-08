import { fn } from 'storybook/test'
import { PolicyConfigurationFormPresentation } from './PolicyConfigurationFormPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.TimeOff.CreateTimeOffPolicy')
  return <>{children}</>
}

const onContinue = fn().mockName('onContinue')
const onCancel = fn().mockName('onCancel')

export default {
  title: 'TimeOff/PolicyConfigurationForm',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

export const Default = () => (
  <PolicyConfigurationFormPresentation onContinue={onContinue} onCancel={onCancel} />
)

export const HoursWorkedVariant = () => (
  <PolicyConfigurationFormPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultValues={{
      accrualMethod: 'per_hour_paid',
    }}
  />
)

export const FixedVariant = () => (
  <PolicyConfigurationFormPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultValues={{
      accrualMethod: 'per_calendar_year',
    }}
  />
)

export const UnlimitedVariant = () => (
  <PolicyConfigurationFormPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultValues={{
      accrualMethod: 'unlimited',
    }}
  />
)

export const EditMode = () => (
  <PolicyConfigurationFormPresentation
    onContinue={onContinue}
    onCancel={onCancel}
    defaultValues={{
      name: 'Awesome Time Off Policy',
      accrualMethod: 'per_hour_paid',
      accrualRate: 2,
      accrualRateUnit: 20,
      includeOvertime: true,
      allPaidHours: false,
      resetDateType: 'per_calendar_year',
      resetMonth: 1,
      resetDay: 1,
    }}
  />
)
