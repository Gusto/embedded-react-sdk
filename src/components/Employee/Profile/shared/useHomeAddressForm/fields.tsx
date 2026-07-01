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

/**
 * The required-field error code produced by {@link useHomeAddressForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the street, city, state, courtesy
 * withholding, and effective date fields. See {@link HomeAddressErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof HomeAddressErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the `zip` field of {@link useHomeAddressForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Zip`. See
 * {@link HomeAddressErrorCodes}.
 *
 * @public
 */
export type ZipValidation = (typeof HomeAddressErrorCodes)['REQUIRED' | 'INVALID_ZIP']

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.Street1` component.
 *
 * @public
 */
export type Street1FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function Street1Field(props: Street1FieldProps) {
  return <TextInputHookField {...props} name="street1" />
}

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.Street2` component.
 *
 * @public
 */
export type Street2FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function Street2Field(props: Street2FieldProps) {
  return <TextInputHookField {...props} name="street2" />
}

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.City` component.
 *
 * @public
 */
export type CityFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function CityField(props: CityFieldProps) {
  return <TextInputHookField {...props} name="city" />
}

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.State` component.
 *
 * @public
 */
export type StateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, string>>

/** @internal */
export function StateField(props: StateFieldProps) {
  return <SelectHookField {...props} name="state" />
}

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.Zip` component.
 *
 * @public
 */
export type ZipFieldProps = HookFieldProps<TextInputHookFieldProps<ZipValidation>>

/** @internal */
export function ZipField(props: ZipFieldProps) {
  return <TextInputHookField {...props} name="zip" />
}

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.CourtesyWithholding` component.
 *
 * @public
 */
export type CourtesyWithholdingFieldProps = HookFieldProps<
  CheckboxHookFieldProps<RequiredValidation>
>

/** @internal */
export function CourtesyWithholdingField(props: CourtesyWithholdingFieldProps) {
  return <CheckboxHookField {...props} name="courtesyWithholding" />
}

/**
 * Props accepted by {@link useHomeAddressForm}'s `Fields.EffectiveDate` component.
 *
 * @public
 */
export type EffectiveDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/** @internal */
export function EffectiveDateField(props: EffectiveDateFieldProps) {
  return <DatePickerHookField {...props} name="effectiveDate" />
}
