import { z } from 'zod'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for {@link TransitionConfiguration}.
 *
 * @alpha
 */
export interface TransitionConfigurationProps extends BaseComponentInterface<'Payroll.TransitionConfiguration'> {
  /** The company ID. */
  companyId: string
  /** The ID of the transition payroll to update. */
  payrollId: string
}

/**
 * Values in the transition payroll settings form.
 *
 * @internal
 */
export interface TransitionConfigurationFormData {
  /** `true` to skip regular deductions. */
  skipRegularDeductions: boolean
}

/** @internal */
export function createTransitionConfigurationSchema() {
  return z.object({
    skipRegularDeductions: z.boolean(),
  })
}

/** @internal */
export interface TransitionConfigurationPresentationProps {
  /** Class name for the root element. */
  className?: string
  /** First day of the pay period (YYYY-MM-DD). */
  payPeriodStartDate?: string | null
  /** Last day of the pay period (YYYY-MM-DD). */
  payPeriodEndDate?: string | null
  /** Pay schedule name, or `null` if unknown. */
  payScheduleName: string | null
  /** Payment date (YYYY-MM-DD), or `null` if unknown. */
  checkDate: string | null
  /** `true` while saving. */
  isPending?: boolean
  /** Tax withholding settings shown in the table. */
  taxWithholdingConfig: OffCycleTaxWithholdingConfig
  /** `true` when the tax withholding modal is open. */
  isTaxWithholdingModalOpen: boolean
  /** Called when the user clicks Edit on the tax table. */
  onTaxWithholdingEditClick: () => void
  /** Called when the user saves new tax settings in the modal. */
  onTaxWithholdingModalDone: (config: OffCycleTaxWithholdingConfig) => void
  /** Called when the user closes the modal without saving. */
  onTaxWithholdingModalCancel: () => void
}
