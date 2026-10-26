import type { ReactNode } from 'react'
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
  /** The deductions and contributions control, rendered in the deductions section. */
  deductionsField: ReactNode
  /** Current tax withholding configuration shown in the table. */
  taxWithholdingConfig: OffCycleTaxWithholdingConfig
  /** Fires when the user confirms a new tax withholding configuration in the modal. */
  onTaxWithholdingChange: (config: OffCycleTaxWithholdingConfig) => void
  /** Whether the save is in flight. */
  isPending?: boolean
}
