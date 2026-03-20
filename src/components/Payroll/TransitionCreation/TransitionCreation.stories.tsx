import { useState } from 'react'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { FormWrapper } from '../../../../.storybook/helpers/FormWrapper'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import { TransitionCreationPresentation } from './TransitionCreationPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.TransitionCreation')
  useI18n('Payroll.OffCycleDeductionsSetting')
  useI18n('Payroll.OffCycleTaxWithholding')
  return <>{children}</>
}

const defaultFormValues = {
  checkDate: null,
  skipRegularDeductions: false,
}

function useTaxWithholdingState() {
  const [config, setConfig] = useState<OffCycleTaxWithholdingConfig>({
    withholdingPayPeriod: WithholdingPayPeriod.EveryOtherWeek,
    withholdingRate: 'regular',
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
  title: 'Domain/Payroll/TransitionCreation',
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
    <TransitionCreationPresentation
      startDate="2024-12-16"
      endDate="2024-12-31"
      payScheduleName="Bi-weekly Schedule"
      {...taxWithholding}
    />
  )
}

export const WithoutPayScheduleName = () => {
  const taxWithholding = useTaxWithholdingState()
  return (
    <TransitionCreationPresentation
      startDate="2024-12-16"
      endDate="2024-12-31"
      payScheduleName={null}
      {...taxWithholding}
    />
  )
}

export const Submitting = () => {
  const taxWithholding = useTaxWithholdingState()
  return (
    <TransitionCreationPresentation
      startDate="2024-12-16"
      endDate="2024-12-31"
      payScheduleName="Bi-weekly Schedule"
      isPending
      {...taxWithholding}
    />
  )
}
