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

/**
 * Text input bound to the `title` field of {@link useJobForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Title` when `withTitleField` is
 * `true` (the default). On update flows where another form owns the title
 * (e.g. compensation edits), set `withTitleField: false` on `useJobForm` and
 * render the compensation form's title field instead.
 *
 * @param props - {@link JobTitleFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `title`.
 * @public
 */
export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="title" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.HireDate` component.
 *
 * @public
 */
export type HireDateFieldProps = HookFieldProps<DatePickerHookFieldProps<JobRequiredValidation>>

/**
 * Date picker bound to the `hireDate` field of {@link useJobForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.HireDate` when
 * `withHireDateField` is `true` (the default). When `false`, supply the value
 * via `JobSubmitOptions.hireDate` at submit time — useful when the hire date
 * is derived from external context (e.g. the employee's `startDate` during
 * onboarding).
 *
 * @param props - {@link HireDateFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered date picker bound to `hireDate`.
 * @public
 */
export function HireDateField(props: HireDateFieldProps) {
  return <DatePickerHookField {...props} name="hireDate" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.TwoPercentShareholder` component.
 *
 * @public
 */
export type TwoPercentShareholderFieldProps = HookFieldProps<CheckboxHookFieldProps>

/**
 * Checkbox bound to the `twoPercentShareholder` field of {@link useJobForm}.
 *
 * @remarks
 * Indicates whether the employee is a 2% shareholder in an S-Corporation.
 * Available on the hook result as `form.Fields.TwoPercentShareholder` only
 * when the company is taxable as an S-Corp (see `data.showTwoPercentShareholder`).
 *
 * @param props - {@link TwoPercentShareholderFieldProps} — accepts the standard hook field props (label, description, FieldComponent override).
 * @returns The rendered checkbox bound to `twoPercentShareholder`.
 * @public
 */
export function TwoPercentShareholderField(props: TwoPercentShareholderFieldProps) {
  return <CheckboxHookField {...props} name="twoPercentShareholder" />
}

/**
 * Props accepted by {@link useJobForm}'s `Fields.StateWcCovered` component.
 *
 * @public
 */
export type StateWcCoveredFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, boolean>>

/**
 * Radio group bound to the `stateWcCovered` field of {@link useJobForm}.
 *
 * @remarks
 * Captures whether the employee is covered by Washington state workers'
 * compensation. Available on the hook result as `form.Fields.StateWcCovered`
 * only when the employee's active work address is in Washington (see
 * `data.showStateWc`).
 *
 * @param props - {@link StateWcCoveredFieldProps} — accepts the standard hook field props (label, description, getOptionLabel, FieldComponent override).
 * @returns The rendered radio group bound to `stateWcCovered`.
 * @public
 */
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

/**
 * Select dropdown bound to the `stateWcClassCode` field of {@link useJobForm}.
 *
 * @remarks
 * Populated with Washington state workers' compensation risk class codes.
 * Available on the hook result as `form.Fields.StateWcClassCode` only when
 * the active work address is in Washington and `stateWcCovered` is `true`.
 * The schema enforces this field as required whenever it is rendered,
 * independent of `optionalFieldsToRequire`.
 *
 * @param props - {@link StateWcClassCodeFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered select bound to `stateWcClassCode`.
 * @public
 */
export function StateWcClassCodeField(props: StateWcClassCodeFieldProps) {
  return <SelectHookField {...props} name="stateWcClassCode" />
}
