import type { Location } from '@gusto/embedded-api-v-2025-11-15/models/components/location'
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

/**
 * Select bound to the `locationUuid` field of {@link useWorkAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Location`. Options are the
 * company's active locations; the hook populates them from the locations
 * query. Required.
 *
 * @param props - {@link LocationFieldProps} — accepts the standard hook field props plus `getOptionLabel` to format location display names.
 * @returns The rendered select bound to `locationUuid`.
 * @public
 */
export function LocationField(props: LocationFieldProps) {
  return <SelectHookField {...props} name="locationUuid" />
}

/**
 * Props accepted by {@link useWorkAddressForm}'s `Fields.EffectiveDate` component.
 *
 * @public
 */
export type EffectiveDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/**
 * Date picker bound to the `effectiveDate` field of {@link useWorkAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.EffectiveDate` when
 * `withEffectiveDateField` is `true`; `undefined` otherwise. Always
 * null-check before rendering.
 *
 * @param props - {@link EffectiveDateFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered date picker bound to `effectiveDate`.
 * @public
 */
export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
