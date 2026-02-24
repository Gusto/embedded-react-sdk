import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import { OffCycleCreationPresentation } from './OffCycleCreationPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleCreation')
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  useI18n('Payroll.OffCycleReasonSelection')
  return <>{children}</>
}

const defaultFormValues = {
  reason: 'bonus',
  isCheckOnly: false,
  startDate: null,
  endDate: null,
  checkDate: null,
}

export default {
  title: 'Domain/Payroll/OffCycleCreation',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <FormWrapper defaultValues={defaultFormValues}>
          <Story />
        </FormWrapper>
      </I18nLoader>
    ),
  ],
}

export const Default = () => {
  return <OffCycleCreationPresentation />
}

export const CorrectionSelected = () => {
  return <OffCycleCreationPresentation />
}
CorrectionSelected.decorators = [
  (Story: React.ComponentType) => (
    <I18nLoader>
      <FormWrapper defaultValues={{ ...defaultFormValues, reason: 'correction' }}>
        <Story />
      </FormWrapper>
    </I18nLoader>
  ),
]

export const CheckOnlyMode = () => {
  return <OffCycleCreationPresentation />
}
CheckOnlyMode.decorators = [
  (Story: React.ComponentType) => (
    <I18nLoader>
      <FormWrapper defaultValues={{ ...defaultFormValues, isCheckOnly: true }}>
        <Story />
      </FormWrapper>
    </I18nLoader>
  ),
]
