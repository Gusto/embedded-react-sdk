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

/** @internal */
export function Street1Field(props: Street1FieldProps) {
  return <TextInputHookField {...props} name="street1" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.Street2` component.
 *
 * @public
 */
export type Street2FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function Street2Field(props: Street2FieldProps) {
  return <TextInputHookField {...props} name="street2" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.City` component.
 *
 * @public
 */
export type CityFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function CityField(props: CityFieldProps) {
  return <TextInputHookField {...props} name="city" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.State` component.
 *
 * @public
 */
export type StateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, string>>

/** @internal */
export function StateField(props: StateFieldProps) {
  return <SelectHookField {...props} name="state" />
}

/**
 * Props accepted by {@link useContractorAddressForm}'s `Fields.Zip` component.
 *
 * @public
 */
export type ZipFieldProps = HookFieldProps<TextInputHookFieldProps<ZipValidation>>

/** @internal */
export function ZipField(props: ZipFieldProps) {
  return <TextInputHookField {...props} name="zip" />
}
