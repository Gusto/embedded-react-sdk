import type { FederalTaxesErrorCodes, FilingStatusValue } from './federalTaxesSchema'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import { SelectHookField, RadioGroupHookField, NumberInputHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof FederalTaxesErrorCodes.REQUIRED

export type FilingStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, FilingStatusValue>
>

export function FilingStatusField(props: FilingStatusFieldProps) {
  return <SelectHookField {...props} name="filingStatus" />
}

export type TwoJobsFieldProps = HookFieldProps<RadioGroupHookFieldProps<RequiredValidation, boolean>>

export function TwoJobsField(props: TwoJobsFieldProps) {
  return <RadioGroupHookField {...props} name="twoJobs" />
}

export type DependentsAmountFieldProps = HookFieldProps<
  NumberInputHookFieldProps<RequiredValidation>
>

export function DependentsAmountField(props: DependentsAmountFieldProps) {
  return <NumberInputHookField {...props} name="dependentsAmount" format="currency" min={0} />
}

export type OtherIncomeFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

export function OtherIncomeField(props: OtherIncomeFieldProps) {
  return <NumberInputHookField {...props} name="otherIncome" format="currency" min={0} />
}

export type DeductionsFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

export function DeductionsField(props: DeductionsFieldProps) {
  return <NumberInputHookField {...props} name="deductions" format="currency" min={0} />
}

export type ExtraWithholdingFieldProps = HookFieldProps<
  NumberInputHookFieldProps<RequiredValidation>
>

export function ExtraWithholdingField(props: ExtraWithholdingFieldProps) {
  return <NumberInputHookField {...props} name="extraWithholding" format="currency" min={0} />
}
