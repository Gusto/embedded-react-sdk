import type { FederalTaxesErrorCodes, FilingStatusValue } from './federalTaxesSchema'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import {
  SelectHookField,
  RadioGroupHookField,
  NumberInputHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The required-field error code produced by {@link useFederalTaxesForm} fields.
 *
 * @remarks
 * Used as the `validationMessages` key for every federal taxes field. See
 * {@link FederalTaxesErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof FederalTaxesErrorCodes.REQUIRED

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.FilingStatus` component.
 *
 * @public
 */
export type FilingStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, FilingStatusValue>
>

/** @internal */
export function FilingStatusField(props: FilingStatusFieldProps) {
  return <SelectHookField {...props} name="filingStatus" />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.TwoJobs` component.
 *
 * @public
 */
export type TwoJobsFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, boolean>
>

/** @internal */
export function TwoJobsField(props: TwoJobsFieldProps) {
  return <RadioGroupHookField {...props} name="twoJobs" />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.DependentsAmount` component.
 *
 * @public
 */
export type DependentsAmountFieldProps = HookFieldProps<
  NumberInputHookFieldProps<RequiredValidation>
>

/** @internal */
export function DependentsAmountField(props: DependentsAmountFieldProps) {
  return <NumberInputHookField {...props} name="dependentsAmount" format="currency" min={0} />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.OtherIncome` component.
 *
 * @public
 */
export type OtherIncomeFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

/** @internal */
export function OtherIncomeField(props: OtherIncomeFieldProps) {
  return <NumberInputHookField {...props} name="otherIncome" format="currency" min={0} />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.Deductions` component.
 *
 * @public
 */
export type DeductionsFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

/** @internal */
export function DeductionsField(props: DeductionsFieldProps) {
  return <NumberInputHookField {...props} name="deductions" format="currency" min={0} />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.ExtraWithholding` component.
 *
 * @public
 */
export type ExtraWithholdingFieldProps = HookFieldProps<
  NumberInputHookFieldProps<RequiredValidation>
>

/** @internal */
export function ExtraWithholdingField(props: ExtraWithholdingFieldProps) {
  return <NumberInputHookField {...props} name="extraWithholding" format="currency" min={0} />
}
