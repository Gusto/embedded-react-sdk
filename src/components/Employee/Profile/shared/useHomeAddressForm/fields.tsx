import type { HomeAddressErrorCodes } from './homeAddressSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import {
  TextInputHookField,
  SelectHookField,
  CheckboxHookField,
  DatePickerHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof HomeAddressErrorCodes.REQUIRED
export type ZipValidation = (typeof HomeAddressErrorCodes)['REQUIRED' | 'INVALID_ZIP']

export type Street1FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function Street1Field(props: Street1FieldProps) {
  return <TextInputHookField {...props} name="street1" />
}

export type Street2FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function Street2Field(props: Street2FieldProps) {
  return <TextInputHookField {...props} name="street2" />
}

export type CityFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function CityField(props: CityFieldProps) {
  return <TextInputHookField {...props} name="city" />
}

export type StateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, string>>

export function StateField(props: StateFieldProps) {
  return <SelectHookField {...props} name="state" />
}

export type ZipFieldProps = HookFieldProps<TextInputHookFieldProps<ZipValidation>>

export function ZipField(props: ZipFieldProps) {
  return <TextInputHookField {...props} name="zip" />
}

export type CourtesyWithholdingFieldProps = HookFieldProps<
  CheckboxHookFieldProps<RequiredValidation>
>

export function CourtesyWithholdingField(props: CourtesyWithholdingFieldProps) {
  return <CheckboxHookField {...props} name="courtesyWithholding" />
}

export type EffectiveDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
