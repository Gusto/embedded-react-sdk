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

/**
 * The required-field error code produced by {@link usePayScheduleForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the custom name, frequency, anchor
 * pay date, and anchor end-of-pay-period fields. See {@link PayScheduleErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof PayScheduleErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `day1` and `day2` fields of {@link usePayScheduleForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Day1` and `Fields.Day2`.
 * See {@link PayScheduleErrorCodes}.
 *
 * @public
 */
export type DayValidation = (typeof PayScheduleErrorCodes)['REQUIRED' | 'DAY_RANGE']

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.CustomName` component.
 *
 * @public
 */
export type CustomNameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function CustomNameField(props: CustomNameFieldProps) {
  return <TextInputHookField {...props} name="customName" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.Frequency` component.
 *
 * @public
 */
export type FrequencyFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, PayScheduleFrequency>
>

/** @internal */
export function FrequencyField(props: FrequencyFieldProps) {
  return <SelectHookField {...props} name="frequency" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.CustomTwicePerMonth` component.
 *
 * @public
 */
export type CustomTwicePerMonthFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, string>>

/** @internal */
export function CustomTwicePerMonthField(props: CustomTwicePerMonthFieldProps) {
  return <RadioGroupHookField {...props} name="customTwicePerMonth" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.AnchorPayDate` component.
 *
 * @public
 */
export type AnchorPayDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/** @internal */
export function AnchorPayDateField(props: AnchorPayDateFieldProps) {
  return <DatePickerHookField {...props} name="anchorPayDate" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.AnchorEndOfPayPeriod` component.
 *
 * @public
 */
export type AnchorEndOfPayPeriodFieldProps = HookFieldProps<
  DatePickerHookFieldProps<RequiredValidation>
>

/** @internal */
export function AnchorEndOfPayPeriodField(props: AnchorEndOfPayPeriodFieldProps) {
  return <DatePickerHookField {...props} name="anchorEndOfPayPeriod" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.Day1` component.
 *
 * @public
 */
export type Day1FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

/** @internal */
export function Day1Field(props: Day1FieldProps) {
  return <NumberInputHookField {...props} name="day1" min={1} max={31} />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.Day2` component.
 *
 * @public
 */
export type Day2FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

/** @internal */
export function Day2Field(props: Day2FieldProps) {
  return <NumberInputHookField {...props} name="day2" min={1} max={31} />
}
