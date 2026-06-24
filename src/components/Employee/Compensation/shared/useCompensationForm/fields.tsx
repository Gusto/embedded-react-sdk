import type { MinimumWage } from '@gusto/embedded-api-v-2026-02-01/models/components/minimumwage'
import type { FlsaStatusType } from '@gusto/embedded-api-v-2026-02-01/models/components/flsastatustype'
import type { PaymentUnit } from '@gusto/embedded-api-v-2026-02-01/models/components/compensation'
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
 * The required-field error code produced by {@link useCompensationForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the title, FLSA status, payment
 * unit, and minimum-wage selection fields. See {@link CompensationErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof CompensationErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `rate` field of {@link useCompensationForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Rate`. See
 * {@link CompensationErrorCodes} for the full description of each code.
 *
 * @public
 */
export type RateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'RATE_MINIMUM'
  | 'RATE_EXEMPT_THRESHOLD']

/**
 * Validation error codes emitted by the `effectiveDate` field of {@link useCompensationForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.EffectiveDate`. See
 * {@link CompensationErrorCodes} for the full description of each code.
 *
 * @public
 */
export type EffectiveDateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'EFFECTIVE_DATE_BEFORE_HIRE'
  | 'EFFECTIVE_DATE_BEFORE_MIN']

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.Title` component.
 *
 * @public
 */
export type TitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `title` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Title`. Optional in both
 * create and update modes — use this when a title change should take effect
 * on this compensation's `effectiveDate` (for example, a future-dated
 * promotion that bundles a new title with a raise). Otherwise bind the title
 * via `useJobForm.Fields.Title` instead and avoid rendering both on the same
 * screen.
 *
 * @param props - {@link TitleFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `title`.
 * @public
 */
export function TitleField(props: TitleFieldProps) {
  return <TextInputHookField {...props} name="title" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.FlsaStatus` component.
 *
 * @public
 */
export type FlsaStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, FlsaStatusType>
>

/**
 * Select bound to the `flsaStatus` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.FlsaStatus` when the FLSA
 * status is editable. The field is `undefined` when the user has no
 * meaningful choice — for example, on a secondary job whose status must
 * match the primary's. Always null-check before rendering. Options:
 * `Exempt`, `Salaried Nonexempt`, `Nonexempt`, `Owner`,
 * `Commission Only Exempt`, `Commission Only Nonexempt`.
 *
 * @param props - {@link FlsaStatusFieldProps} — accepts the standard hook field props plus `getOptionLabel` for FLSA status display.
 * @returns The rendered select bound to `flsaStatus`.
 * @public
 */
export function FlsaStatusField(props: FlsaStatusFieldProps) {
  return <SelectHookField {...props} name="flsaStatus" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.Rate` component.
 *
 * @public
 */
export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

/**
 * Currency-formatted number input bound to the `rate` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Rate` when the rate is
 * partner-editable. The field is `undefined` for commission-only FLSA
 * statuses (`Commission Only Exempt`, `Commission Only Nonexempt`) — those
 * statuses don't accept a partner-supplied rate, so the hook removes the
 * field and forces `rate=0` on the form values. Always null-check before
 * rendering.
 *
 * @param props - {@link RateFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered currency-formatted number input bound to `rate`.
 * @public
 */
export function RateField(props: RateFieldProps) {
  return <NumberInputHookField {...props} name="rate" format="currency" min={0} />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.PaymentUnit` component.
 *
 * @public
 */
export type PaymentUnitFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PaymentUnit>
>

/**
 * Select bound to the `paymentUnit` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.PaymentUnit` when the
 * payment unit is partner-editable. The field is `undefined` for
 * commission-only FLSA statuses (the hook forces `paymentUnit=Year`),
 * and automatically rendered disabled when `flsaStatus === Owner`
 * (locked to `Paycheck`). Options: `Hour`, `Week`, `Month`, `Year`,
 * `Paycheck`.
 *
 * @param props - {@link PaymentUnitFieldProps} — accepts the standard hook field props plus `getOptionLabel` for payment-unit display.
 * @returns The rendered select bound to `paymentUnit`.
 * @public
 */
export function PaymentUnitField(props: PaymentUnitFieldProps) {
  return <SelectHookField {...props} name="paymentUnit" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.AdjustForMinimumWage` component.
 *
 * @public
 */
export type AdjustForMinimumWageFieldProps = HookFieldProps<CheckboxHookFieldProps>

/**
 * Checkbox bound to the `adjustForMinimumWage` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AdjustForMinimumWage` when
 * minimum-wage adjustment applies — `Nonexempt` FLSA status, minimum wages
 * are available at the employee's work location, and the work state
 * supports tip credits. Always null-check before rendering.
 *
 * @param props - {@link AdjustForMinimumWageFieldProps} — accepts the standard hook field props (label, description, FieldComponent override).
 * @returns The rendered checkbox bound to `adjustForMinimumWage`.
 * @public
 */
export function AdjustForMinimumWageField(props: AdjustForMinimumWageFieldProps) {
  return <CheckboxHookField {...props} name="adjustForMinimumWage" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.MinimumWageId` component.
 *
 * @public
 */
export type MinimumWageIdFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, MinimumWage>
>

/**
 * Select bound to the `minimumWageId` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.MinimumWageId` when
 * `Fields.AdjustForMinimumWage` is rendered and the user has checked it.
 * Options are dynamically populated from the minimum wages available at the
 * employee's work location.
 *
 * @param props - {@link MinimumWageIdFieldProps} — accepts the standard hook field props plus `getOptionLabel` for minimum-wage display.
 * @returns The rendered select bound to `minimumWageId`.
 * @public
 */
export function MinimumWageIdField(props: MinimumWageIdFieldProps) {
  return <SelectHookField {...props} name="minimumWageId" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.EffectiveDate` component.
 *
 * @public
 */
export type EffectiveDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<EffectiveDateValidation>
>

/**
 * Date picker bound to the `effectiveDate` field of {@link useCompensationForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.EffectiveDate` when
 * `withEffectiveDateField` is `true` (the default). Required on create;
 * optional on update unless `optionalFieldsToRequire.update` includes
 * `'effectiveDate'`. The picker's min/max bounds are exposed on
 * `data.minimumEffectiveDate` / `data.maximumEffectiveDate`. The field is
 * automatically disabled (and the form value forced to today) while
 * `status.willDeleteSecondaryJobs` is `true` in update mode.
 *
 * When `withEffectiveDateField: false`, the field is `undefined` — supply
 * the value at submit time via `CompensationSubmitOptions.effectiveDate`
 * instead.
 *
 * @param props - {@link EffectiveDateFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered date picker bound to `effectiveDate`.
 * @public
 */
export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
