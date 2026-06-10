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
 * Validation error codes that `useJobForm` fields surface through `validationMessages`.
 *
 * @public
 */
export type JobRequiredValidation = typeof JobErrorCodes.REQUIRED

/**
 * Props for the job title field surfaced as `useJobForm` `Fields.Title`.
 *
 * @public
 */
export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<JobRequiredValidation>>

/**
 * Text input field for the job title, surfaced as `useJobForm` `Fields.Title`.
 *
 * @remarks
 * Required on create; optional on update unless `optionalFieldsToRequire.update`
 * includes `'title'`.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered job title input bound to the `title` field.
 * @public
 */
export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="title" />
}

/**
 * Props for the hire date field surfaced as `useJobForm` `Fields.HireDate`.
 *
 * @public
 */
export type HireDateFieldProps = HookFieldProps<DatePickerHookFieldProps<JobRequiredValidation>>

/**
 * Date picker field for the employee's hire date, surfaced as `useJobForm` `Fields.HireDate`.
 *
 * @remarks
 * Required on create; optional on update unless `optionalFieldsToRequire.update`
 * includes `'hireDate'`. Set `withHireDateField: false` on `useJobForm` to omit this
 * field and supply the value via `JobSubmitOptions.hireDate` at submit time instead.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered hire date picker bound to the `hireDate` field.
 * @public
 */
export function HireDateField(props: HireDateFieldProps) {
  return <DatePickerHookField {...props} name="hireDate" />
}

/**
 * Props for the 2% shareholder checkbox surfaced as `useJobForm` `Fields.TwoPercentShareholder`.
 *
 * @public
 */
export type TwoPercentShareholderFieldProps = HookFieldProps<CheckboxHookFieldProps>

/**
 * Checkbox field indicating whether the employee is a 2% shareholder in an S-Corp,
 * surfaced as `useJobForm` `Fields.TwoPercentShareholder`.
 *
 * @remarks
 * Only rendered (non-`undefined` on `Fields`) when the company is taxable as an S-Corp,
 * i.e. `data.showTwoPercentShareholder` is `true`.
 *
 * @param props - Field configuration including `label` and `description`.
 * @returns The rendered checkbox bound to the `twoPercentShareholder` field.
 * @public
 */
export function TwoPercentShareholderField(props: TwoPercentShareholderFieldProps) {
  return <CheckboxHookField {...props} name="twoPercentShareholder" />
}

/**
 * Props for the Washington state workers' compensation coverage radio group
 * surfaced as `useJobForm` `Fields.StateWcCovered`.
 *
 * @public
 */
export type StateWcCoveredFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, boolean>>

/**
 * Radio group field for Washington state workers' compensation coverage,
 * surfaced as `useJobForm` `Fields.StateWcCovered`.
 *
 * @remarks
 * Only rendered when the employee's active work address is in Washington state,
 * i.e. `data.showStateWc` is `true`.
 *
 * @param props - Field configuration including `label`, `description`, and `getOptionLabel`.
 * @returns The rendered radio group bound to the `stateWcCovered` field.
 * @public
 */
export function StateWcCoveredField(props: StateWcCoveredFieldProps) {
  return <RadioGroupHookField {...props} name="stateWcCovered" />
}

/**
 * Props for the Washington state workers' compensation risk class code select
 * surfaced as `useJobForm` `Fields.StateWcClassCode`.
 *
 * @public
 */
export type StateWcClassCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<JobRequiredValidation, WARiskClassCode>
>

/**
 * Select dropdown for the Washington state workers' compensation risk class code,
 * surfaced as `useJobForm` `Fields.StateWcClassCode`.
 *
 * @remarks
 * Only rendered when the work address is in Washington and `stateWcCovered` is `true`.
 * Required whenever rendered — the schema enforces this independently of
 * `optionalFieldsToRequire`. Options are populated from the canonical Washington
 * state risk class code list.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered select bound to the `stateWcClassCode` field.
 * @public
 */
export function StateWcClassCodeField(props: StateWcClassCodeFieldProps) {
  return <SelectHookField {...props} name="stateWcClassCode" />
}
