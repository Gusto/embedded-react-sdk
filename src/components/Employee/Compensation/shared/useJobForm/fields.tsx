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

export type JobRequiredValidation = typeof JobErrorCodes.REQUIRED

export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<JobRequiredValidation>>

export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="title" />
}

export type HireDateFieldProps = HookFieldProps<DatePickerHookFieldProps<JobRequiredValidation>>

export function HireDateField(props: HireDateFieldProps) {
  return <DatePickerHookField {...props} name="hireDate" />
}

export type TwoPercentShareholderFieldProps = HookFieldProps<CheckboxHookFieldProps>

export function TwoPercentShareholderField(props: TwoPercentShareholderFieldProps) {
  return <CheckboxHookField {...props} name="twoPercentShareholder" />
}

export type StateWcCoveredFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, boolean>>

export function StateWcCoveredField(props: StateWcCoveredFieldProps) {
  return <RadioGroupHookField {...props} name="stateWcCovered" />
}

export type StateWcClassCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<JobRequiredValidation, WARiskClassCode>
>

export function StateWcClassCodeField(props: StateWcClassCodeFieldProps) {
  return <SelectHookField {...props} name="stateWcClassCode" />
}
