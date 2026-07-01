import type { GarnishmentType } from '@gusto/embedded-api-v-2026-02-01/models/components/garnishment'
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

/**
 * Text input bound to the `description` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Description`. Always rendered.
 *
 * @param props - {@link DescriptionFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `description`.
 * @public
 */
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

/**
 * Radio group bound to the `recurring` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Recurring`. Always rendered.
 * Picks between a recurring deduction (taken every paycheck) and a one-time
 * deduction. The cap fields (`Fields.TotalAmount` and `Fields.AnnualMaximum`)
 * are exposed only when this is set to recurring.
 *
 * @param props - {@link RecurringFieldProps} — accepts the standard hook field props plus `getOptionLabel` for boolean display.
 * @returns The rendered radio group bound to `recurring`.
 * @public
 */
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

/**
 * Radio group bound to the `deductAsPercentage` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.DeductAsPercentage`. Always
 * rendered. Toggles how `Fields.Amount` is interpreted — as a fixed currency
 * amount when `false`, or as a percentage of paycheck when `true`.
 *
 * @param props - {@link DeductAsPercentageFieldProps} — accepts the standard hook field props plus `getOptionLabel` for boolean display.
 * @returns The rendered radio group bound to `deductAsPercentage`.
 * @public
 */
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

/**
 * Number input bound to the `amount` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Amount`. Always rendered.
 * Interpreted as a currency amount when `Fields.DeductAsPercentage` is set to
 * a fixed amount, or as a percentage of paycheck when it's set to percentage.
 *
 * @param props - {@link AmountFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered number input bound to `amount`.
 * @public
 */
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

/**
 * Number input bound to the `totalAmount` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.TotalAmount` only when
 * `status.isRecurring` is `true`. A zero value means "no cap" — the hook
 * drops it on the wire. Always null-check before rendering.
 *
 * @param props - {@link TotalAmountFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered number input bound to `totalAmount`.
 * @public
 */
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

/**
 * Number input bound to the `annualMaximum` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AnnualMaximum` only when
 * `status.isRecurring` is `true`. A zero value means "no cap" — the hook
 * drops it on the wire. Always null-check before rendering.
 *
 * @param props - {@link AnnualMaximumFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered number input bound to `annualMaximum`.
 * @public
 */
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

/**
 * Select bound to the `garnishmentType` field of {@link useDeductionForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.GarnishmentType` only when the
 * hook is constructed with `courtOrdered: true`. Always null-check before
 * rendering. Options: `Federal Tax Lien`, `State Tax Lien`, `Student Loan`,
 * `Creditor Garnishment`, `Federal Loan`, `Other Garnishment`. For
 * child-support garnishments, use {@link useChildSupportGarnishmentForm}.
 *
 * @param props - {@link GarnishmentTypeFieldProps} — accepts the standard hook field props plus `getOptionLabel` for garnishment-type display.
 * @returns The rendered select bound to `garnishmentType`.
 * @public
 */
export function GarnishmentTypeField(props: GarnishmentTypeFieldProps) {
  return <SelectHookField {...props} name="garnishmentType" />
}
