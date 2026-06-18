import type { SplitPaymentsFormErrorCodes, SplitByValue } from './useSplitPaymentsFormSchema'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation error codes emitted by {@link useSplitPaymentsForm} fields that only emit `REQUIRED`.
 *
 * @public
 */
export type RequiredValidation = typeof SplitPaymentsFormErrorCodes.REQUIRED

/**
 * Props accepted by {@link useSplitPaymentsForm}'s `Fields.SplitBy` component.
 *
 * @public
 */
export type SplitByFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, SplitByValue>
>

/**
 * Radio group bound to the `splitBy` field of {@link useSplitPaymentsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.SplitBy`. Options are
 * `Percentage` and `Amount`; defaults to the employee's existing `splitBy` or
 * `Percentage`. Toggling the value resets per-split amounts.
 *
 * @param props - See {@link SplitByFieldProps}.
 * @returns The rendered radio group bound to `splitBy`.
 * @public
 */
export function SplitByField(props: SplitByFieldProps) {
  return <RadioGroupHookField {...props} name="splitBy" />
}
