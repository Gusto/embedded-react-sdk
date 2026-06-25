import type { ContractorAddressErrorCodes } from './contractorAddressSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import { TextInputHookField, SelectHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The required-field error code produced by {@link useContractorAddressForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the street, city, and state fields.
 * See {@link ContractorAddressErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorAddressErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `zip` field of {@link useContractorAddressForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Zip`. See
 * {@link ContractorAddressErrorCodes}.
 *
 * @public
 */
export type ZipValidation = (typeof ContractorAddressErrorCodes)['REQUIRED' | 'INVALID_ZIP']

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.Street1` component.
 *
 * @public
 */
export type Street1FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `street1` field of {@link useContractorAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Street1`. Required.
 *
 * @param props - {@link Street1FieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `street1`.
 * @public
 */
export function Street1Field(props: Street1FieldProps) {
  return <TextInputHookField {...props} name="street1" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.Street2` component.
 *
 * @public
 */
export type Street2FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `street2` field of {@link useContractorAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Street2`. Optional.
 *
 * @param props - {@link Street2FieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `street2`.
 * @public
 */
export function Street2Field(props: Street2FieldProps) {
  return <TextInputHookField {...props} name="street2" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.City` component.
 *
 * @public
 */
export type CityFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `city` field of {@link useContractorAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.City`. Required.
 *
 * @param props - {@link CityFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `city`.
 * @public
 */
export function CityField(props: CityFieldProps) {
  return <TextInputHookField {...props} name="city" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.State` component.
 *
 * @public
 */
export type StateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, string>>

/**
 * Select bound to the `state` field of {@link useContractorAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.State`. Options are the
 * standard two-letter US state abbreviations. Required.
 *
 * @param props - {@link StateFieldProps} — accepts the standard hook field props plus `getOptionLabel` to localize state names.
 * @returns The rendered select bound to `state`.
 * @public
 */
export function StateField(props: StateFieldProps) {
  return <SelectHookField {...props} name="state" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.Zip` component.
 *
 * @public
 */
export type ZipFieldProps = HookFieldProps<TextInputHookFieldProps<ZipValidation>>

/**
 * Text input bound to the `zip` field of {@link useContractorAddressForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Zip`. Required; also validates
 * ZIP code format and emits `INVALID_ZIP` when the value does not match.
 *
 * @param props - {@link ZipFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `zip`.
 * @public
 */
export function ZipField(props: ZipFieldProps) {
  return <TextInputHookField {...props} name="zip" />
}
