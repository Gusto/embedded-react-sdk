import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import { OffCycleReasonSelectionPresentation } from './OffCycleReasonSelectionPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleReasonSelection')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/OffCycleReasonSelection',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <FormWrapper defaultValues={{ reason: '' }}>
          <Story />
        </FormWrapper>
      </I18nLoader>
    ),
  ],
}

export const Default = () => {
  return <OffCycleReasonSelectionPresentation name="reason" />
}

export const BonusSelected = () => {
  return <OffCycleReasonSelectionPresentation name="reason" />
}
BonusSelected.decorators = [
  (Story: React.ComponentType) => (
    <I18nLoader>
      <FormWrapper defaultValues={{ reason: 'bonus' }}>
        <Story />
      </FormWrapper>
    </I18nLoader>
  ),
]

export const CorrectionSelected = () => {
  return <OffCycleReasonSelectionPresentation name="reason" />
}
CorrectionSelected.decorators = [
  (Story: React.ComponentType) => (
    <I18nLoader>
      <FormWrapper defaultValues={{ reason: 'correction' }}>
        <Story />
      </FormWrapper>
    </I18nLoader>
  ),
]
