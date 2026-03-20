import { useState } from 'react'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import { OffCycleCreationPresentation } from './OffCycleCreationPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.OffCycleCreation')
  useI18n('Payroll.OffCyclePayPeriodDateForm')
  useI18n('Payroll.OffCycleReasonSelection')
  useI18n('Payroll.OffCycleDeductionsSetting')
  useI18n('Payroll.EmployeeSelection')
  useI18n('Payroll.OffCycleTaxWithholding')
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
  includeAllEmployees: false,
  selectedEmployeeUuids: [] as string[],
}

function useTaxWithholdingState(
  initialRate: OffCycleTaxWithholdingConfig['withholdingRate'] = 'supplemental',
) {
  const [config, setConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: initialRate,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  return {
    taxWithholdingConfig: config,
    isTaxWithholdingModalOpen: isModalOpen,
    onTaxWithholdingEditClick: () => {
      setIsModalOpen(true)
    },
    onTaxWithholdingModalDone: (updated: OffCycleTaxWithholdingConfig) => {
      setConfig(updated)
      setIsModalOpen(false)
    },
    onTaxWithholdingModalCancel: () => {
      setIsModalOpen(false)
    },
  }
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
  const taxWithholding = useTaxWithholdingState()
  return (
    <OffCycleCreationPresentation
      employees={mockEmployees}
      isLoadingEmployees={false}
      {...taxWithholding}
    />
  )
}

export const CorrectionSelected = () => {
  const taxWithholding = useTaxWithholdingState('regular')
  return (
    <OffCycleCreationPresentation
      employees={mockEmployees}
      isLoadingEmployees={false}
      {...taxWithholding}
    />
  )
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
  const taxWithholding = useTaxWithholdingState()
  return (
    <OffCycleCreationPresentation
      employees={mockEmployees}
      isLoadingEmployees={false}
      {...taxWithholding}
    />
  )
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
