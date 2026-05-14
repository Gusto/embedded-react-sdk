import type { PaymentMethodFormErrorCodes, PaymentMethodType } from './usePaymentMethodFormSchema'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof PaymentMethodFormErrorCodes.REQUIRED

export type TypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, PaymentMethodType>
>

export function TypeField(props: TypeFieldProps) {
  return <RadioGroupHookField {...props} name="type" />
}
