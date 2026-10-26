import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Props accepted by {@link useTransitionConfigurationForm}'s `Fields.SkipRegularDeductions` component.
 *
 * @internal
 */
export type SkipRegularDeductionsFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, boolean>
>

/** @internal */
export function SkipRegularDeductionsField(props: SkipRegularDeductionsFieldProps) {
  return <RadioGroupHookField {...props} name="skipRegularDeductions" />
}
