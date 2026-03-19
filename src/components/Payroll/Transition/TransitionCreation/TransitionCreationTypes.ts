import type { OffCycleTaxWithholdingConfig } from '../../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

export interface TransitionCreationProps extends BaseComponentInterface<'Payroll.Transition'> {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
}

export interface TransitionCreationFormData {
  checkDate: Date | null
  skipRegularDeductions: boolean
}

export interface TransitionCreationPresentationProps {
  startDate: string
  endDate: string
  payScheduleName: string | null
  isPending?: boolean
  taxWithholdingConfig: OffCycleTaxWithholdingConfig
  isTaxWithholdingModalOpen: boolean
  onTaxWithholdingEditClick: () => void
  onTaxWithholdingModalDone: (config: OffCycleTaxWithholdingConfig) => void
  onTaxWithholdingModalCancel: () => void
}
