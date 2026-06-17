import type { OffCycleReason } from '../OffCycleReasonSelection'
import type {
  OffCyclePayPeriodDateFormData,
  OffCyclePayrollDateType,
} from '../OffCyclePayPeriodDateForm'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { MultiSelectComboBoxOption } from '@/components/Common/UI/MultiSelectComboBox/MultiSelectComboBoxTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for the {@link OffCycleCreation} component.
 *
 * @public
 */
export interface OffCycleCreationProps extends BaseComponentInterface<'Payroll.OffCycleCreation'> {
  /** The associated company identifier. */
  companyId: string
  /** Pre-selected off-cycle reason. The creation form starts with this reason selected. Defaults to `'bonus'`. */
  payrollType?: OffCyclePayrollDateType
}

/**
 * Form values collected by the {@link OffCycleCreation} component.
 *
 * @public
 */
export interface OffCycleCreationFormData extends OffCyclePayPeriodDateFormData {
  /** The off-cycle reason — `'bonus'` or `'correction'`. */
  reason: OffCycleReason
  /** When `true`, regular deductions are skipped for this payroll. */
  skipRegularDeductions: boolean
  /** When `true`, every onboarded active employee is included in the payroll. */
  includeAllEmployees: boolean
  /** Employee UUIDs to include. Only consulted when `includeAllEmployees` is `false`. */
  selectedEmployeeUuids: string[]
}

/** @internal */
export interface OffCycleCreationPresentationProps {
  /** Selectable employees rendered in the multi-select. */
  employees: MultiSelectComboBoxOption[]
  /** Whether the off-cycle create mutation is in flight. */
  isPending?: boolean
  /** Current tax withholding configuration shown in the table. */
  taxWithholdingConfig: OffCycleTaxWithholdingConfig
  /** Whether the tax withholding edit modal is open. */
  isTaxWithholdingModalOpen: boolean
  /** Fires when the user clicks the edit affordance on the tax withholding table. */
  onTaxWithholdingEditClick: () => void
  /** Fires when the user confirms a new tax withholding configuration in the modal. */
  onTaxWithholdingModalDone: (config: OffCycleTaxWithholdingConfig) => void
  /** Fires when the user dismisses the tax withholding modal without saving. */
  onTaxWithholdingModalCancel: () => void
}
