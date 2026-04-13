import type { TextInputHookFieldProps } from '../../form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '../../form/fields/SelectHookField'
import type { CheckboxHookFieldProps } from '../../form/fields/CheckboxHookField'
import type { DatePickerHookFieldProps } from '../../form/fields/DatePickerHookField'
import {
  TextInputHookField,
  SelectHookField,
  CheckboxHookField,
  DatePickerHookField,
} from '../../form/fields'
import type { HomeAddressErrorCodes } from './homeAddressSchema'
import type { HookFieldProps } from '@/types/sdkHooks'

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

export type StateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation>>

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
