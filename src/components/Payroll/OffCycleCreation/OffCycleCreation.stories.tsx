import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import { OffCycleCreationPresentation } from './OffCycleCreationPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleCreation')
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  useI18n('Payroll.OffCycleReasonSelection')
  useI18n('Payroll.OffCycleDeductionsSetting')
  useI18n('Payroll.EmployeeSelection')
  return <>{children}</>
}

const mockEmployees = [
  { label: 'Lana Steiner', value: 'uuid-1' },
  { label: 'Jane Smith', value: 'uuid-2' },
  { label: 'John Doe', value: 'uuid-3' },
]

const defaultFormValues = {
  reason: 'bonus',
  isCheckOnly: false,
  startDate: null,
  endDate: null,
  checkDate: null,
  skipRegularDeductions: false,
  includeAllEmployees: true,
  selectedEmployeeUuids: [] as string[],
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
  return <OffCycleCreationPresentation employees={mockEmployees} isLoadingEmployees={false} />
}

export const CorrectionSelected = () => {
  return <OffCycleCreationPresentation employees={mockEmployees} isLoadingEmployees={false} />
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
  return <OffCycleCreationPresentation employees={mockEmployees} isLoadingEmployees={false} />
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
