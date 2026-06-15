import type { PaymentMethodFormErrorCodes, PaymentMethodType } from './usePaymentMethodFormSchema'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation error codes emitted by {@link usePaymentMethodForm} fields that only emit `REQUIRED`.
 *
 * @public
 */
export type RequiredValidation = typeof PaymentMethodFormErrorCodes.REQUIRED

/**
 * Props accepted by {@link usePaymentMethodForm}'s `Fields.Type` component.
 *
 * @public
 */
export type TypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, PaymentMethodType>
>

/**
 * Radio group bound to the `type` field of {@link usePaymentMethodForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Type`. Options are
 * `Direct Deposit` and `Check`; defaults to the employee's existing payment
 * method type. Supply `getOptionLabel` to translate the option labels.
 *
 * @param props - See {@link TypeFieldProps}.
 * @returns The rendered radio group bound to `type`.
 * @public
 */
export function TypeField(props: TypeFieldProps) {
  return <RadioGroupHookField {...props} name="type" />
}
