import type { JobErrorCodes } from './jobSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import {
  TextInputHookField,
  CheckboxHookField,
  RadioGroupHookField,
  SelectHookField,
  DatePickerHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'
import type { WARiskClassCode } from '@/models/WA_RISK_CODES'

/**
 * The validation error code a {@link useJobForm} field can produce.
 *
 * @remarks
 * Currently a single literal — `'REQUIRED'` — surfaced as the key in
 * `validationMessages` on each `Fields.*` component. Future schema additions
 * may extend the union.
 *
 * @public
 */
export type JobRequiredValidation = typeof JobErrorCodes.REQUIRED

/**
 * Props accepted by {@link useJobForm}'s `Fields.Title` component.
 *
 * @public
 */
export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<JobRequiredValidation>>

/** @internal */
export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="title" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.HireDate` component.
 *
 * @public
 */
export type HireDateFieldProps = HookFieldProps<DatePickerHookFieldProps<JobRequiredValidation>>

/** @internal */
export function HireDateField(props: HireDateFieldProps) {
  return <DatePickerHookField {...props} name="hireDate" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.TwoPercentShareholder` component.
 *
 * @public
 */
export type TwoPercentShareholderFieldProps = HookFieldProps<CheckboxHookFieldProps>

/** @internal */
export function TwoPercentShareholderField(props: TwoPercentShareholderFieldProps) {
  return <CheckboxHookField {...props} name="twoPercentShareholder" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.StateWcCovered` component.
 *
 * @public
 */
export type StateWcCoveredFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, boolean>>

/** @internal */
export function StateWcCoveredField(props: StateWcCoveredFieldProps) {
  return <RadioGroupHookField {...props} name="stateWcCovered" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.StateWcClassCode` component.
 *
 * @public
 */
export type StateWcClassCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<JobRequiredValidation, WARiskClassCode>
>

/** @internal */
export function StateWcClassCodeField(props: StateWcClassCodeFieldProps) {
  return <SelectHookField {...props} name="stateWcClassCode" />
}
