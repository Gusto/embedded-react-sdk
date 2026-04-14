import type { Location } from '@gusto/embedded-api/models/components/location'
import type { WorkAddressErrorCodes } from './workAddressSchema'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import { SelectHookField, DatePickerHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof WorkAddressErrorCodes.REQUIRED

export type LocationFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, Location>>

export function LocationField(props: LocationFieldProps) {
  return <SelectHookField {...props} name="locationUuid" />
}

export type EffectiveDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
