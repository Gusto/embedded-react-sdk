import type { MinimumWage } from '@gusto/embedded-api/models/components/minimumwage'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { PaymentUnit } from '@gusto/embedded-api/models/components/compensation'
import type { CompensationErrorCodes } from './compensationSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import {
  TextInputHookField,
  SelectHookField,
  NumberInputHookField,
  CheckboxHookField,
  RadioGroupHookField,
  DatePickerHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'
import type { WARiskClassCode } from '@/models/WA_RISK_CODES'

export type RequiredValidation = typeof CompensationErrorCodes.REQUIRED
export type RateValidation = (typeof CompensationErrorCodes)[
  | 'REQUIRED'
  | 'RATE_MINIMUM'
  | 'RATE_EXEMPT_THRESHOLD']

export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="jobTitle" />
}

export type FlsaStatusFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, FlsaStatusType>
>

export function FlsaStatusField(props: FlsaStatusFieldProps) {
  return <SelectHookField {...props} name="flsaStatus" />
}

export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

export function RateField(props: RateFieldProps) {
  return <NumberInputHookField {...props} name="rate" format="currency" min={0} />
}

export type PaymentUnitFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PaymentUnit>
>

export function PaymentUnitField(props: PaymentUnitFieldProps) {
  return <SelectHookField {...props} name="paymentUnit" />
}

export type AdjustForMinimumWageFieldProps = HookFieldProps<CheckboxHookFieldProps>

export function AdjustForMinimumWageField(props: AdjustForMinimumWageFieldProps) {
  return <CheckboxHookField {...props} name="adjustForMinimumWage" />
}

export type MinimumWageIdFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, MinimumWage>
>

export function MinimumWageIdField(props: MinimumWageIdFieldProps) {
  return <SelectHookField {...props} name="minimumWageId" />
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
  SelectHookFieldProps<RequiredValidation, WARiskClassCode>
>

export function StateWcClassCodeField(props: StateWcClassCodeFieldProps) {
  return <SelectHookField {...props} name="stateWcClassCode" />
}

export type StartDateFieldProps = HookFieldProps<
  DatePickerHookFieldProps<typeof CompensationErrorCodes.REQUIRED>
>

export function StartDateField(props: StartDateFieldProps) {
  return <DatePickerHookField {...props} name="startDate" />
}
