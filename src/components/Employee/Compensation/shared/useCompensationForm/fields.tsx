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
  'REQUIRED' | 'RATE_MINIMUM' | 'RATE_EXEMPT_THRESHOLD']

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
  'REQUIRED' | 'EFFECTIVE_DATE_BEFORE_HIRE' | 'EFFECTIVE_DATE_BEFORE_MIN']

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.Title` component.
 *
 * @public
 */
export type TitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
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

/** @internal */
export function FlsaStatusField(props: FlsaStatusFieldProps) {
  return <SelectHookField {...props} name="flsaStatus" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.Rate` component.
 *
 * @public
 */
export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

/** @internal */
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

/** @internal */
export function PaymentUnitField(props: PaymentUnitFieldProps) {
  return <SelectHookField {...props} name="paymentUnit" />
}

/**
 * Props accepted by {@link useCompensationForm}'s `Fields.AdjustForMinimumWage` component.
 *
 * @public
 */
export type AdjustForMinimumWageFieldProps = HookFieldProps<CheckboxHookFieldProps>

/** @internal */
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

/** @internal */
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

/** @internal */
export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
