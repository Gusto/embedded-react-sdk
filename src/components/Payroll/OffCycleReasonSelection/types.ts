import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Reason for running an off-cycle payroll.
 *
 * `bonus` covers bonuses, gifts, or commissions; `correction` covers any payroll run outside the regular pay schedule.
 *
 * @public
 */
export type OffCycleReason = 'bonus' | 'correction'

/**
 * Tax withholding rate applied to an off-cycle payroll.
 *
 * `supplemental` applies the IRS supplemental withholding rate; `regular` applies the employee's regular withholding rate.
 *
 * @public
 */
export type WithholdingType = 'supplemental' | 'regular'

/**
 * Recommended deduction and withholding defaults paired with an off-cycle reason.
 *
 * @public
 */
export interface OffCycleReasonDefaults {
  /** Whether regular deductions and contributions should be skipped for this payroll. */
  skipDeductions: boolean
  /** Withholding rate to apply for this payroll. */
  withholdingType: WithholdingType
}

/**
 * Default deduction and withholding settings keyed by off-cycle reason.
 *
 * @remarks
 * `bonus` defaults to skipping regular deductions and using the supplemental withholding rate.
 * `correction` defaults to including regular deductions and using the regular withholding rate.
 *
 * @public
 */
export const OFF_CYCLE_REASON_DEFAULTS: Record<OffCycleReason, OffCycleReasonDefaults> = {
  bonus: {
    skipDeductions: true,
    withholdingType: 'supplemental',
  },
  correction: {
    skipDeductions: false,
    withholdingType: 'regular',
  },
}

/**
 * Payload emitted with the `offCycle/selectReason` event when a reason is chosen.
 *
 * @public
 */
export interface SelectReasonPayload {
  /** The reason the user selected. */
  reason: OffCycleReason
  /** Recommended deduction and withholding defaults for the selected reason. */
  defaults: OffCycleReasonDefaults
}

/**
 * Props for the {@link OffCycleReasonSelection} component.
 *
 * @public
 */
export interface OffCycleReasonSelectionProps extends BaseComponentInterface<'Payroll.OffCycleReasonSelection'> {
  /** The associated company identifier. */
  companyId: string
}
