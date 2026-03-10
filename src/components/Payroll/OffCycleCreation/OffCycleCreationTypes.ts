import type { OffCycleReason } from '../OffCycleReasonSelection'
import type {
  OffCyclePayPeriodDateFormData,
  OffCyclePayrollDateType,
} from '../OffCyclePayPeriodDateForm'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { MultiSelectComboBoxOption } from '@/components/Common/UI/MultiSelectComboBox/MultiSelectComboBoxTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

export interface OffCycleCreationProps extends BaseComponentInterface<'Payroll.OffCycleCreation'> {
  companyId: string
  payrollType?: OffCyclePayrollDateType
}

export interface OffCycleCreationFormData extends OffCyclePayPeriodDateFormData {
  reason: OffCycleReason
  skipRegularDeductions: boolean
  includeAllEmployees: boolean
  selectedEmployeeUuids: string[]
}

export interface OffCycleCreationPresentationProps {
  employees: MultiSelectComboBoxOption[]
  isLoadingEmployees: boolean
  isPending?: boolean
  taxWithholdingConfig: OffCycleTaxWithholdingConfig
  isTaxWithholdingModalOpen: boolean
  onTaxWithholdingEditClick: () => void
  onTaxWithholdingModalDone: (config: OffCycleTaxWithholdingConfig) => void
  onTaxWithholdingModalCancel: () => void
}
