import type { GarnishmentType } from '@gusto/embedded-api/models/components/garnishment'
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

export type RequiredValidation = typeof DeductionFormErrorCodes.REQUIRED
export type NegativeAmountValidation = typeof DeductionFormErrorCodes.NEGATIVE_AMOUNT

export type AmountValidation = RequiredValidation | NegativeAmountValidation
export type CapValidation = NegativeAmountValidation

// ── Description ────────────────────────────────────────────────────────

export type DescriptionFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function DescriptionField(props: DescriptionFieldProps) {
  return <TextInputHookField {...props} name="description" />
}

// ── Recurring (radio: boolean) ─────────────────────────────────────────

export type RecurringFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, boolean>
>

export function RecurringField(props: RecurringFieldProps) {
  return <RadioGroupHookField {...props} name="recurring" />
}

// ── DeductAsPercentage (radio: boolean) ────────────────────────────────

export type DeductAsPercentageFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, boolean>
>

export function DeductAsPercentageField(props: DeductAsPercentageFieldProps) {
  return <RadioGroupHookField {...props} name="deductAsPercentage" />
}

// ── Amount (currency or percent depending on deductAsPercentage) ───────

export type AmountFieldProps = HookFieldProps<NumberInputHookFieldProps<AmountValidation>>

export function AmountField(props: AmountFieldProps) {
  return <NumberInputHookField {...props} name="amount" />
}

// ── TotalAmount (optional cap — only meaningful when recurring) ────────

export type TotalAmountFieldProps = HookFieldProps<NumberInputHookFieldProps<CapValidation>>

export function TotalAmountField(props: TotalAmountFieldProps) {
  return <NumberInputHookField {...props} name="totalAmount" />
}

// ── AnnualMaximum (optional annual cap — only meaningful when recurring) ─

export type AnnualMaximumFieldProps = HookFieldProps<NumberInputHookFieldProps<CapValidation>>

export function AnnualMaximumField(props: AnnualMaximumFieldProps) {
  return <NumberInputHookField {...props} name="annualMaximum" />
}

// ── GarnishmentType (court-ordered only) ───────────────────────────────

export type GarnishmentTypeFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, GarnishmentType>
>

export function GarnishmentTypeField(props: GarnishmentTypeFieldProps) {
  return <SelectHookField {...props} name="garnishmentType" />
}
