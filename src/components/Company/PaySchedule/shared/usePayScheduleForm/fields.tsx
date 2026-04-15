import type { PayScheduleErrorCodes, PayScheduleFrequency } from './payScheduleSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import {
  TextInputHookField,
  SelectHookField,
  RadioGroupHookField,
  DatePickerHookField,
  NumberInputHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof PayScheduleErrorCodes.REQUIRED
export type DayValidation = (typeof PayScheduleErrorCodes)['REQUIRED' | 'DAY_RANGE']

export type CustomNameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function CustomNameField(props: CustomNameFieldProps) {
  return <TextInputHookField {...props} name="customName" />
}

export type FrequencyFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PayScheduleFrequency>
>

export function FrequencyField(props: FrequencyFieldProps) {
  return <SelectHookField {...props} name="frequency" />
}

export type CustomTwicePerMonthFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, string>>

export function CustomTwicePerMonthField(props: CustomTwicePerMonthFieldProps) {
  return <RadioGroupHookField {...props} name="customTwicePerMonth" />
}

export type AnchorPayDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

export function AnchorPayDateField(props: AnchorPayDateFieldProps) {
  return <DatePickerHookField {...props} name="anchorPayDate" />
}

export type AnchorEndOfPayPeriodFieldProps = HookFieldProps<
  DatePickerHookFieldProps<RequiredValidation>
>

export function AnchorEndOfPayPeriodField(props: AnchorEndOfPayPeriodFieldProps) {
  return <DatePickerHookField {...props} name="anchorEndOfPayPeriod" />
}

export type Day1FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

export function Day1Field(props: Day1FieldProps) {
  return <NumberInputHookField {...props} name="day1" min={1} max={31} />
}

export type Day2FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

export function Day2Field(props: Day2FieldProps) {
  return <NumberInputHookField {...props} name="day2" min={1} max={31} />
}
