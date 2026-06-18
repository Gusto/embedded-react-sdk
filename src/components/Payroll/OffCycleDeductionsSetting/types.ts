import type { CommonComponentInterface } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

/**
 * Props for {@link OffCycleDeductionsSetting}.
 *
 * @public
 */
export interface OffCycleDeductionsSettingProps extends CommonComponentInterface<'Payroll.OffCycleDeductionsSetting'> {
  /** Whether regular deductions are currently being skipped. */
  skipRegularDeductions: boolean
  /** Event handler invoked when the deduction preference changes. See the events table on {@link OffCycleDeductionsSetting}. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Payload emitted by {@link OffCycleDeductionsSetting} on the `offCycle/deductionsChange` event.
 *
 * @public
 */
export interface OffCycleDeductionsSettingChangePayload {
  /** Whether the user selected to skip regular deductions. */
  skipRegularDeductions: boolean
}
