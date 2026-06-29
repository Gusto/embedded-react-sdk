import type { ContractorPaymentMethodFormType } from './contractorPaymentMethodSchema'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import { RadioGroupHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Props accepted by {@link useContractorPaymentMethodForm}'s `Fields.Type` component.
 *
 * @public
 */
export type TypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, ContractorPaymentMethodFormType>
>

/**
 * Radio group bound to the `type` field of {@link useContractorPaymentMethodForm}.
 *
 * @remarks
 * Selects whether the contractor is paid by Direct Deposit or Check. Provide
 * `getOptionLabel` to localize the option labels.
 *
 * @param props - See {@link TypeFieldProps}.
 * @returns The rendered radio group bound to `type`.
 * @public
 */
export function TypeField(props: TypeFieldProps) {
  return <RadioGroupHookField {...props} name="type" />
}
