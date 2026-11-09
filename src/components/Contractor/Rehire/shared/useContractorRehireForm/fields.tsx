import type { ContractorRehireErrorCodes } from './contractorRehireSchema'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import { DatePickerHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The error codes produced by {@link useContractorRehireForm}'s start-date field. Use it to
 * type the `validationMessages` map supplied to the field.
 *
 * @public
 */
export type StartDateValidation = (typeof ContractorRehireErrorCodes)[
  'REQUIRED' | 'START_DATE_BEFORE_MIN']

/**
 * Props accepted by {@link useContractorRehireForm}'s `Fields.StartDate` component.
 *
 * @public
 */
export type StartDateFieldProps = HookFieldProps<DatePickerHookFieldProps<StartDateValidation>>

/** @internal */
export function StartDateField(props: StartDateFieldProps) {
  return <DatePickerHookField {...props} name="startDate" />
}
