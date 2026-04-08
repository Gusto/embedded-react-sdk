import type { TextInputHookFieldProps } from '../../form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '../../form/fields/SelectHookField'
import type { RadioGroupHookFieldProps } from '../../form/fields/RadioGroupHookField'
import type { DatePickerHookFieldProps } from '../../form/fields/DatePickerHookField'
import type { NumberInputHookFieldProps } from '../../form/fields/NumberInputHookField'
import {
  TextInputHookField,
  SelectHookField,
  RadioGroupHookField,
  DatePickerHookField,
  NumberInputHookField,
} from '../../form/fields'
import type { PayScheduleErrorCodes, PayScheduleFrequency } from './payScheduleSchema'
import type { HookFieldProps } from '@/types/sdkHooks'

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
