import { z } from 'zod'
import type { OffCycleTaxWithholdingConfig } from '../OffCycleTaxWithholdingTable/OffCycleTaxWithholdingTableTypes'
import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for the {@link TransitionCreation} component.
 *
 * @public
 */
export interface TransitionCreationProps extends BaseComponentInterface<'Payroll.TransitionCreation'> {
  /** The associated company identifier. */
  companyId: string
  /** The start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** The end date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** The UUID of the pay schedule this transition is associated with. */
  payScheduleUuid: string
}

/**
 * Form values collected by the {@link TransitionCreation} component.
 *
 * @public
 */
export interface TransitionCreationFormData {
  /** The date employees will be paid. Must be at least the company's ACH lead time from today. */
  checkDate: Date | null
  /** When `true`, regular deductions are skipped for this payroll. */
  skipRegularDeductions: boolean
}

/** @internal */
export function createTransitionCreationSchema(
  t: (key: string, options?: Record<string, unknown>) => string,
  minCheckDate: Date,
  paymentSpeedDays?: number,
) {
  return z.object({
    checkDate: z
      .date()
      .nullable()
      .refine((val): val is Date => val !== null, {
        message: t('errors.checkDateRequired'),
      })
      .refine(
        val => {
          const normalized = new Date(val)
          normalized.setHours(0, 0, 0, 0)
          const min = new Date(minCheckDate)
          min.setHours(0, 0, 0, 0)
          return normalized >= min
        },
        { message: t('errors.checkDateAchLeadTime', { count: paymentSpeedDays ?? 2 }) },
      ),
    skipRegularDeductions: z.boolean(),
  })
}

/** @internal */
export interface TransitionCreationPresentationProps {
  /** The start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** The end date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** Display name of the associated pay schedule, or `null` when none is available. */
  payScheduleName: string | null
  /** Whether the create off-cycle mutation is in flight. */
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
