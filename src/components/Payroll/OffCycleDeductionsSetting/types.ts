import type { CommonComponentInterface } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface OffCycleDeductionsSettingProps extends CommonComponentInterface<'Payroll.OffCycleDeductionsSetting'> {
  skipRegularDeductions: boolean
  onEvent: OnEventType<EventType, unknown>
}

export interface OffCycleDeductionsSettingChangePayload {
  skipRegularDeductions: boolean
}
