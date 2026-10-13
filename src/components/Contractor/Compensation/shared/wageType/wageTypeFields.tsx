import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import { RadioGroupHookField, NumberInputHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Props for the shared wage type radio group field.
 *
 * @internal
 */
export type SharedWageTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, 'Fixed' | 'Hourly'>
>

/**
 * Hook-connected radio group bound to the `wageType` form field.
 *
 * @param props - Radio group field props.
 * @returns The rendered wage type radio group.
 * @internal
 */
export function WageTypeField(props: SharedWageTypeFieldProps) {
  return <RadioGroupHookField {...props} name="wageType" />
}

/**
 * Hook-connected number input bound to the `hourlyRate` form field.
 *
 * @param props - Number input field props.
 * @returns The rendered hourly rate input.
 * @internal
 */
export function HourlyRateField(
  props: HookFieldProps<NumberInputHookFieldProps<'REQUIRED' | 'MAX_HOURLY_RATE'>>,
) {
  return <NumberInputHookField {...props} name="hourlyRate" />
}
