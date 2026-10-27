import { z } from 'zod'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for the {@link TransitionConfiguration} component.
 *
 * @alpha
 */
export interface TransitionConfigurationProps extends BaseComponentInterface<'Payroll.TransitionConfiguration'> {
  /** The associated company identifier. */
  companyId: string
  /** The identifier of the existing transition payroll to configure. */
  payrollId: string
}

/**
 * Form values collected by the {@link TransitionConfiguration} component.
 *
 * @internal
 */
export interface TransitionConfigurationFormData {
  /** When `true`, regular deductions are skipped for this payroll. */
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
  /** CSS class name applied to the component's root element. */
  className?: string
  /** The start date of the transition pay period (YYYY-MM-DD). */
  payPeriodStartDate?: string | null
  /** The end date of the transition pay period (YYYY-MM-DD). */
  payPeriodEndDate?: string | null
  /** Display name of the associated pay schedule, or `null` when none is available. */
  payScheduleName: string | null
  /** The payroll's payment date (YYYY-MM-DD), shown read only, or `null` when unknown. */
  checkDate: string | null
  /** Whether the prepare or update request is in flight. */
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
