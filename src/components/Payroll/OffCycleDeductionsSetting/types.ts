import type { OffCycleReason } from '../OffCycleReasonSelection'
import type { BaseComponentInterface } from '@/components/Base/Base'

export interface OffCycleDeductionsSettingProps extends BaseComponentInterface<'Payroll.OffCycleDeductionsSetting'> {
  offCycleReason: OffCycleReason
}

export interface OffCycleDeductionsSettingChangePayload {
  skipRegularDeductions: boolean
}
