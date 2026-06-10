import type { MinimumWage } from '@gusto/embedded-api-v-2025-11-15/models/components/minimumwage'
import type { FlsaStatusType } from '@gusto/embedded-api-v-2025-11-15/models/components/flsastatustype'
import type { PaymentUnit } from '@gusto/embedded-api-v-2025-11-15/models/components/compensation'
import type { CompensationErrorCodes } from './compensationSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import {
  TextInputHookField,
  SelectHookField,
  NumberInputHookField,
  CheckboxHookField,
  DatePickerHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * Validation error code that `useCompensationForm` fields with only a required
 * rule surface through `validationMessages`.
 *
 * @public
 */
export type RequiredValidation = typeof CompensationErrorCodes.REQUIRED

/**
 * Validation error codes surfaced by `Fields.Rate` through `validationMessages`:
 * the required rule, the $1.00 minimum, and the FLSA Exempt salary threshold.
 *
 * @public
 */
export type RateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'RATE_MINIMUM'
  | 'RATE_EXEMPT_THRESHOLD']

/**
 * Validation error codes surfaced by `Fields.EffectiveDate` through
 * `validationMessages`: the required rule, the hire-date lower bound, and the
 * caller-supplied minimum effective date.
 *
 * @public
 */
export type EffectiveDateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'EFFECTIVE_DATE_BEFORE_HIRE'
  | 'EFFECTIVE_DATE_BEFORE_MIN']

/**
 * Props for the compensation title field surfaced as `useCompensationForm`
 * `Fields.Title`.
 *
 * @public
 */
export type TitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input field for the compensation title, surfaced as
 * `useCompensationForm` `Fields.Title`.
 *
 * @remarks
 * Optional in both modes unless `optionalFieldsToRequire` requires it. Use this
 * when the title change should take effect on this compensation's
 * `effectiveDate`. Bind title via `useJobForm` `Fields.Title` instead when
 * creating a job or renaming the active role immediately — do not render both
 * on the same screen.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered title input bound to the `title` field.
 * @public
 */
export function TitleField(props: TitleFieldProps) {
  return <TextInputHookField {...props} name="title" />
}

/**
 * Props for the FLSA status select surfaced as `useCompensationForm`
 * `Fields.FlsaStatus`.
 *
 * @public
 */
export type FlsaStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, FlsaStatusType>
>

/**
 * Select dropdown for the employee's FLSA classification, surfaced as
 * `useCompensationForm` `Fields.FlsaStatus`.
 *
 * @remarks
 * Options: `Exempt`, `Salaried Nonexempt`, `Nonexempt`, `Owner`,
 * `Commission Only Exempt`, `Commission Only Nonexempt`. The hook removes this
 * field from `Fields` (sets it to `undefined`) when the FLSA status cannot be
 * changed — e.g. a non-primary job whose status must match the primary's.
 *
 * @param props - Field configuration including `label`, `description`, `getOptionLabel`, and `validationMessages`.
 * @returns The rendered select bound to the `flsaStatus` field.
 * @public
 */
export function FlsaStatusField(props: FlsaStatusFieldProps) {
  return <SelectHookField {...props} name="flsaStatus" />
}

/**
 * Props for the compensation rate field surfaced as `useCompensationForm`
 * `Fields.Rate`.
 *
 * @public
 */
export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

/**
 * Number input for the compensation amount, formatted as currency, surfaced as
 * `useCompensationForm` `Fields.Rate`.
 *
 * @remarks
 * The hook removes this field from `Fields` when the FLSA status is
 * `Commission Only Exempt` or `Commission Only Nonexempt` — those statuses do
 * not accept a partner-supplied rate, so the hook forces `rate=0` internally.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered currency input bound to the `rate` field.
 * @public
 */
export function RateField(props: RateFieldProps) {
  return <NumberInputHookField {...props} name="rate" format="currency" min={0} />
}

/**
 * Props for the payment unit select surfaced as `useCompensationForm`
 * `Fields.PaymentUnit`.
 *
 * @public
 */
export type PaymentUnitFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PaymentUnit>
>

/**
 * Select dropdown for the pay period unit, surfaced as `useCompensationForm`
 * `Fields.PaymentUnit`.
 *
 * @remarks
 * Options: `Hour`, `Week`, `Month`, `Year`, `Paycheck`. Automatically disabled
 * (and forced to `Paycheck`) when the FLSA status is `Owner`. The hook removes
 * this field from `Fields` when the FLSA status is commission-only — the
 * payment unit is forced to `Year` internally in that state.
 *
 * @param props - Field configuration including `label`, `description`, `getOptionLabel`, and `validationMessages`.
 * @returns The rendered select bound to the `paymentUnit` field.
 * @public
 */
export function PaymentUnitField(props: PaymentUnitFieldProps) {
  return <SelectHookField {...props} name="paymentUnit" />
}

/**
 * Props for the minimum-wage adjustment checkbox surfaced as
 * `useCompensationForm` `Fields.AdjustForMinimumWage`.
 *
 * @public
 */
export type AdjustForMinimumWageFieldProps = HookFieldProps<CheckboxHookFieldProps>

/**
 * Checkbox field that enables minimum-wage adjustment, surfaced as
 * `useCompensationForm` `Fields.AdjustForMinimumWage`.
 *
 * @remarks
 * Only rendered when the FLSA status is `Nonexempt`, minimum wages exist for
 * the employee's work location, and the work state supports tip credits.
 *
 * @param props - Field configuration including `label` and `description`.
 * @returns The rendered checkbox bound to the `adjustForMinimumWage` field.
 * @public
 */
export function AdjustForMinimumWageField(props: AdjustForMinimumWageFieldProps) {
  return <CheckboxHookField {...props} name="adjustForMinimumWage" />
}

/**
 * Props for the minimum-wage selection field surfaced as `useCompensationForm`
 * `Fields.MinimumWageId`.
 *
 * @public
 */
export type MinimumWageIdFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, MinimumWage>
>

/**
 * Select dropdown for choosing which minimum wage to adjust to, surfaced as
 * `useCompensationForm` `Fields.MinimumWageId`.
 *
 * @remarks
 * Only rendered when `Fields.AdjustForMinimumWage` is checked. Options are
 * populated from the minimum wages available at the employee's work location.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered select bound to the `minimumWageId` field.
 * @public
 */
export function MinimumWageIdField(props: MinimumWageIdFieldProps) {
  return <SelectHookField {...props} name="minimumWageId" />
}

/**
 * Props for the effective date picker surfaced as `useCompensationForm`
 * `Fields.EffectiveDate`.
 *
 * @public
 */
export type EffectiveDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<EffectiveDateValidation>
>

/**
 * Date picker for when the compensation row takes effect, surfaced as
 * `useCompensationForm` `Fields.EffectiveDate`.
 *
 * @remarks
 * Required on create; optional on update unless `optionalFieldsToRequire.update`
 * includes `'effectiveDate'`. Use `data.minimumEffectiveDate` and
 * `data.maximumEffectiveDate` to constrain the picker. Automatically disabled
 * (and forced to today) while `status.willDeleteSecondaryJobs` is `true`.
 * Set `withEffectiveDateField: false` on `useCompensationForm` to omit this
 * field and supply the value via `CompensationSubmitOptions.effectiveDate` at
 * submit time instead.
 *
 * @param props - Field configuration including `label`, `description`, and `validationMessages`.
 * @returns The rendered date picker bound to the `effectiveDate` field.
 * @public
 */
export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
