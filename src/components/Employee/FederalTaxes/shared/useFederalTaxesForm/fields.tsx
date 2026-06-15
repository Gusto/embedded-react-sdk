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

/**
 * Select bound to the `filingStatus` field of {@link useFederalTaxesForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.FilingStatus`. Options are
 * populated from `FILING_STATUS_VALUES` (`Single`, `Married`,
 * `Head of Household`, `Exempt from withholding`). The default option label is
 * the raw filing status value — pass `getOptionLabel` to localize.
 *
 * @param props - {@link FilingStatusFieldProps} — accepts the standard hook field props plus `getOptionLabel` for filing-status display.
 * @returns The rendered select bound to `filingStatus`.
 * @public
 */
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

/**
 * Radio group bound to the `twoJobs` field of {@link useFederalTaxesForm} for the W-4 multiple-jobs question (Step 2c).
 *
 * @remarks
 * Available on the hook result as `form.Fields.TwoJobs`. Two options for
 * `true` and `false`. The default labels are `Yes` and `No` — pass
 * `getOptionLabel` to localize. The form submits a boolean value.
 *
 * @param props - {@link TwoJobsFieldProps} — accepts the standard hook field props plus `getOptionLabel` for option display.
 * @returns The rendered radio group bound to `twoJobs`.
 * @public
 */
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

/**
 * Currency-formatted number input bound to the `dependentsAmount` field of {@link useFederalTaxesForm} for the W-4 dependents total (Step 3).
 *
 * @remarks
 * Available on the hook result as `form.Fields.DependentsAmount`. The field
 * renders with `format="currency"` and `min={0}`. Empty values coerce to `0`
 * and pass the required check.
 *
 * @param props - {@link DependentsAmountFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered currency-formatted number input bound to `dependentsAmount`.
 * @public
 */
export function DependentsAmountField(props: DependentsAmountFieldProps) {
  return <NumberInputHookField {...props} name="dependentsAmount" format="currency" min={0} />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.OtherIncome` component.
 *
 * @public
 */
export type OtherIncomeFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

/**
 * Currency-formatted number input bound to the `otherIncome` field of {@link useFederalTaxesForm} for the W-4 other-income field (Step 4a).
 *
 * @remarks
 * Available on the hook result as `form.Fields.OtherIncome`. The field
 * renders with `format="currency"` and `min={0}`. Empty values coerce to `0`
 * and pass the required check.
 *
 * @param props - {@link OtherIncomeFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered currency-formatted number input bound to `otherIncome`.
 * @public
 */
export function OtherIncomeField(props: OtherIncomeFieldProps) {
  return <NumberInputHookField {...props} name="otherIncome" format="currency" min={0} />
}

/**
 * Props accepted by {@link useFederalTaxesForm}'s `Fields.Deductions` component.
 *
 * @public
 */
export type DeductionsFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

/**
 * Currency-formatted number input bound to the `deductions` field of {@link useFederalTaxesForm} for the W-4 deductions field (Step 4b).
 *
 * @remarks
 * Available on the hook result as `form.Fields.Deductions`. The field
 * renders with `format="currency"` and `min={0}`. Empty values coerce to `0`
 * and pass the required check.
 *
 * @param props - {@link DeductionsFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered currency-formatted number input bound to `deductions`.
 * @public
 */
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

/**
 * Currency-formatted number input bound to the `extraWithholding` field of {@link useFederalTaxesForm} for the W-4 extra-withholding field (Step 4c).
 *
 * @remarks
 * Available on the hook result as `form.Fields.ExtraWithholding`. The field
 * renders with `format="currency"` and `min={0}`. Empty values coerce to `0`
 * and pass the required check.
 *
 * @param props - {@link ExtraWithholdingFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered currency-formatted number input bound to `extraWithholding`.
 * @public
 */
export function ExtraWithholdingField(props: ExtraWithholdingFieldProps) {
  return <NumberInputHookField {...props} name="extraWithholding" format="currency" min={0} />
}
