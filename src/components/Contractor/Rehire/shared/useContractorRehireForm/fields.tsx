import type { ContractorRehireErrorCodes } from './contractorRehireSchema'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import { DatePickerHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The required-field error code produced by {@link useContractorRehireForm} fields.
 * Use it to type the `validationMessages` map supplied to a field.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorRehireErrorCodes.REQUIRED

/**
 * Props accepted by {@link useContractorRehireForm}'s `Fields.StartDate` component.
 *
 * @public
 */
export type StartDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/** @internal */
export function StartDateField(props: StartDateFieldProps) {
  return <DatePickerHookField {...props} name="startDate" />
}
