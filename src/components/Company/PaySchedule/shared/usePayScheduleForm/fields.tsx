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

/**
 * Text input bound to the `customName` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.CustomName`. Always required.
 *
 * @param props - {@link CustomNameFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `customName`.
 * @public
 */
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

/**
 * Select dropdown bound to the `frequency` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Frequency`. Always required.
 * Options are `'Every week'`, `'Every other week'`, `'Twice per month'`, and
 * `'Monthly'`. Pass `getOptionLabel` to customize how options are displayed.
 *
 * @param props - {@link FrequencyFieldProps} — accepts the standard hook field props plus `getOptionLabel`.
 * @returns The rendered select bound to `frequency`.
 * @public
 */
export function FrequencyField(props: FrequencyFieldProps) {
  return <SelectHookField {...props} name="frequency" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.CustomTwicePerMonth` component.
 *
 * @public
 */
export type CustomTwicePerMonthFieldProps = HookFieldProps<RadioGroupHookFieldProps<never, string>>

/**
 * Radio group bound to the `customTwicePerMonth` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.CustomTwicePerMonth`. Only present
 * when the selected frequency is `'Twice per month'`; otherwise the entry on
 * `Fields` is `undefined`. Options are `'1st15th'` (15th and last day of the
 * month) and `'custom'` (manual day entry via `Day1` and `Day2`).
 *
 * @param props - {@link CustomTwicePerMonthFieldProps} — accepts the standard hook field props.
 * @returns The rendered radio group bound to `customTwicePerMonth`.
 * @public
 */
export function CustomTwicePerMonthField(props: CustomTwicePerMonthFieldProps) {
  return <RadioGroupHookField {...props} name="customTwicePerMonth" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.AnchorPayDate` component.
 *
 * @public
 */
export type AnchorPayDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/**
 * Date picker bound to the `anchorPayDate` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AnchorPayDate`. Always required.
 * Represents the date of the first paycheck under this schedule.
 *
 * @param props - {@link AnchorPayDateFieldProps} — accepts the standard hook field props.
 * @returns The rendered date picker bound to `anchorPayDate`.
 * @public
 */
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

/**
 * Date picker bound to the `anchorEndOfPayPeriod` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.AnchorEndOfPayPeriod`. Always
 * required. Represents the end date of the first pay period and is used to
 * calculate future pay periods. May be the same date as the first pay date.
 *
 * @param props - {@link AnchorEndOfPayPeriodFieldProps} — accepts the standard hook field props.
 * @returns The rendered date picker bound to `anchorEndOfPayPeriod`.
 * @public
 */
export function AnchorEndOfPayPeriodField(props: AnchorEndOfPayPeriodFieldProps) {
  return <DatePickerHookField {...props} name="anchorEndOfPayPeriod" />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.Day1` component.
 *
 * @public
 */
export type Day1FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

/**
 * Number input bound to the `day1` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Day1`. Only present when the
 * frequency is `'Monthly'`, or when the frequency is `'Twice per month'` and
 * `customTwicePerMonth` is `'custom'`; otherwise the entry on `Fields` is
 * `undefined`. Accepts integers in the range 1–31.
 *
 * @param props - {@link Day1FieldProps} — accepts the standard hook field props.
 * @returns The rendered number input bound to `day1`.
 * @public
 */
export function Day1Field(props: Day1FieldProps) {
  return <NumberInputHookField {...props} name="day1" min={1} max={31} />
}

/**
 * Props accepted by {@link usePayScheduleForm}'s `Fields.Day2` component.
 *
 * @public
 */
export type Day2FieldProps = HookFieldProps<NumberInputHookFieldProps<DayValidation>>

/**
 * Number input bound to the `day2` field of {@link usePayScheduleForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Day2`. Only present when the
 * frequency is `'Twice per month'` and `customTwicePerMonth` is `'custom'`;
 * otherwise the entry on `Fields` is `undefined`. Accepts integers in the range 1–31.
 *
 * @param props - {@link Day2FieldProps} — accepts the standard hook field props.
 * @returns The rendered number input bound to `day2`.
 * @public
 */
export function Day2Field(props: Day2FieldProps) {
  return <NumberInputHookField {...props} name="day2" min={1} max={31} />
}
