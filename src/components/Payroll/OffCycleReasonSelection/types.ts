import type { BaseComponentInterface } from '@/components/Base/Base'

export type OffCycleReason = 'bonus' | 'correction'

export type WithholdingType = 'supplemental' | 'regular'

export interface OffCycleReasonDefaults {
  skipDeductions: boolean
  withholdingType: WithholdingType
}

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

export interface SelectReasonPayload {
  reason: OffCycleReason
  defaults: OffCycleReasonDefaults
}

export interface OffCycleReasonSelectionProps extends BaseComponentInterface<'Payroll.OffCycleReasonSelection'> {
  companyId: string
}
