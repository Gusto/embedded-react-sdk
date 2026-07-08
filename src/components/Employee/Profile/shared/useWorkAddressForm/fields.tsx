import type { Location } from '@gusto/embedded-api/models/components/location'
import type { WorkAddressErrorCodes } from './workAddressSchema'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import { SelectHookField, DatePickerHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The required-field error code produced by {@link useWorkAddressForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the location and effective date fields.
 * See `WorkAddressErrorCodes`.
 *
 * @public
 */
export type RequiredValidation = typeof WorkAddressErrorCodes.REQUIRED

/**
 * Props accepted by {@link useWorkAddressForm}'s `Fields.Location` component.
 *
 * @public
 */
export type LocationFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, Location>>

/** @internal */
export function LocationField(props: LocationFieldProps) {
  return <SelectHookField {...props} name="locationUuid" />
}

/**
 * Props accepted by {@link useWorkAddressForm}'s `Fields.EffectiveDate` component.
 *
 * @public
 */
export type EffectiveDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/** @internal */
export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
