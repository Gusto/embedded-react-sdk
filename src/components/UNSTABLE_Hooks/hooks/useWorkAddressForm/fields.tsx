import type { Location } from '@gusto/embedded-api/models/components/location'
import type { HookFieldProps } from '../../form/types'
import type { SelectHookFieldProps } from '../../form/fields/SelectHookField'
import type { DatePickerHookFieldProps } from '../../form/fields/DatePickerHookField'
import { SelectHookField, DatePickerHookField } from '../../form/fields'
import type { WorkAddressErrorCodes } from './workAddressSchema'

export type RequiredValidation = typeof WorkAddressErrorCodes.REQUIRED

export type LocationFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, Location>>

export function LocationField(props: LocationFieldProps) {
  return <SelectHookField {...props} name="locationUuid" />
}

export type EffectiveDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
