import type { GarnishmentType } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import type { DeductionFormErrorCodes } from './deductionFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import {
  TextInputHookField,
  NumberInputHookField,
  RadioGroupHookField,
  SelectHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The required-field error code produced by {@link useDeductionForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the description, recurring,
 * deduct-as-percentage, and garnishment-type fields. See
 * {@link DeductionFormErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof DeductionFormErrorCodes.REQUIRED

/**
 * The negative-amount error code produced by {@link useDeductionForm}'s currency fields.
 *
 * @remarks
 * Used as a `validationMessages` key on `Fields.Amount`, `Fields.TotalAmount`,
 * and `Fields.AnnualMaximum`. See {@link DeductionFormErrorCodes}.
 *
 * @public
 */
export type NegativeAmountValidation = typeof DeductionFormErrorCodes.NEGATIVE_AMOUNT

/**
 * Validation error codes emitted by the `amount` field of {@link useDeductionForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Amount`. See
 * {@link DeductionFormErrorCodes} for the full description of each code.
 *
 * @public
 */
export type AmountValidation = RequiredValidation | NegativeAmountValidation

/**
 * Validation error codes emitted by the cap fields of {@link useDeductionForm} (`totalAmount`, `annualMaximum`).
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.TotalAmount` and
 * `Fields.AnnualMaximum`. See {@link DeductionFormErrorCodes} for the full
 * description of each code.
 *
 * @public
 */
export type CapValidation = NegativeAmountValidation

// ── Description ────────────────────────────────────────────────────────

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.Description` component.
 *
 * @public
 */
export type DescriptionFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function DescriptionField(props: DescriptionFieldProps) {
  return <TextInputHookField {...props} name="description" />
}

// ── Recurring (radio: boolean) ─────────────────────────────────────────

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.Recurring` component.
 *
 * @public
 */
export type RecurringFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, boolean>
>

/** @internal */
export function RecurringField(props: RecurringFieldProps) {
  return <RadioGroupHookField {...props} name="recurring" />
}

// ── DeductAsPercentage (radio: boolean) ────────────────────────────────

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.DeductAsPercentage` component.
 *
 * @public
 */
export type DeductAsPercentageFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, boolean>
>

/** @internal */
export function DeductAsPercentageField(props: DeductAsPercentageFieldProps) {
  return <RadioGroupHookField {...props} name="deductAsPercentage" />
}

// ── Amount (currency or percent depending on deductAsPercentage) ───────

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.Amount` component.
 *
 * @public
 */
export type AmountFieldProps = HookFieldProps<NumberInputHookFieldProps<AmountValidation>>

/** @internal */
export function AmountField(props: AmountFieldProps) {
  return <NumberInputHookField {...props} name="amount" />
}

// ── TotalAmount (optional cap — only meaningful when recurring) ────────

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.TotalAmount` component.
 *
 * @public
 */
export type TotalAmountFieldProps = HookFieldProps<NumberInputHookFieldProps<CapValidation>>

/** @internal */
export function TotalAmountField(props: TotalAmountFieldProps) {
  return <NumberInputHookField {...props} name="totalAmount" />
}

// ── AnnualMaximum (optional annual cap — only meaningful when recurring) ─

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.AnnualMaximum` component.
 *
 * @public
 */
export type AnnualMaximumFieldProps = HookFieldProps<NumberInputHookFieldProps<CapValidation>>

/** @internal */
export function AnnualMaximumField(props: AnnualMaximumFieldProps) {
  return <NumberInputHookField {...props} name="annualMaximum" />
}

// ── GarnishmentType (court-ordered only) ───────────────────────────────

/**
 * Props accepted by {@link useDeductionForm}'s `Fields.GarnishmentType` component.
 *
 * @public
 */
export type GarnishmentTypeFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, GarnishmentType>
>

/** @internal */
export function GarnishmentTypeField(props: GarnishmentTypeFieldProps) {
  return <SelectHookField {...props} name="garnishmentType" />
}
