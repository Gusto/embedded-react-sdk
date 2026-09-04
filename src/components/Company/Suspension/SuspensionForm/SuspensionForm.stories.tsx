import { FormWrapper } from '../../../../../.storybook/helpers/FormWrapper'
import { SuspensionFormPresentation } from './SuspensionFormPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Company.Suspension.Form')
  return <>{children}</>
}

const baseDefaults = {
  reason: undefined,
  leavingFor: undefined,
  comments: '',
  reconcileTaxMethod: undefined,
  fileQuarterlyForms: false,
  fileYearlyForms: false,
}

export default {
  title: 'Domain/Company/Suspension/SuspensionForm',
}

export const Default = () => (
  <I18nLoader>
    <FormWrapper defaultValues={baseDefaults}>
      <SuspensionFormPresentation />
    </FormWrapper>
  </I18nLoader>
)

export const SwitchingProvider = () => (
  <I18nLoader>
    <FormWrapper defaultValues={{ ...baseDefaults, reason: 'switching_provider' }}>
      <SuspensionFormPresentation />
    </FormWrapper>
  </I18nLoader>
)

export const LeavingForOther = () => (
  <I18nLoader>
    <FormWrapper
      defaultValues={{ ...baseDefaults, reason: 'switching_provider', leavingFor: 'other' }}
    >
      <SuspensionFormPresentation />
    </FormWrapper>
  </I18nLoader>
)

export const ChangingEinWarning = () => (
  <I18nLoader>
    <FormWrapper defaultValues={{ ...baseDefaults, reason: 'changing_ein_or_entity_type' }}>
      <SuspensionFormPresentation />
    </FormWrapper>
  </I18nLoader>
)

export const PayTaxes = () => (
  <I18nLoader>
    <FormWrapper
      defaultValues={{ ...baseDefaults, reason: 'shutting_down', reconcileTaxMethod: 'pay_taxes' }}
    >
      <SuspensionFormPresentation />
    </FormWrapper>
  </I18nLoader>
)

export const RefundTaxes = () => (
  <I18nLoader>
    <FormWrapper
      defaultValues={{
        ...baseDefaults,
        reason: 'shutting_down',
        reconcileTaxMethod: 'refund_taxes',
      }}
    >
      <SuspensionFormPresentation />
    </FormWrapper>
  </I18nLoader>
)
