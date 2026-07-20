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

/** @internal */
export function TypeField(props: TypeFieldProps) {
  return <RadioGroupHookField {...props} name="type" />
}
