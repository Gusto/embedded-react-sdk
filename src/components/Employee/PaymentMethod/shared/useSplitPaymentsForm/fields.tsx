import type { SplitPaymentsFormErrorCodes, SplitByValue } from './useSplitPaymentsFormSchema'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof SplitPaymentsFormErrorCodes.REQUIRED

export type SplitByFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, SplitByValue>
>

export function SplitByField(props: SplitByFieldProps) {
  return <RadioGroupHookField {...props} name="splitBy" />
}
