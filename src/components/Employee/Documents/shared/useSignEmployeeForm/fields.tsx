import type { SignEmployeeFormErrorCodes } from './signEmployeeFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import {
  TextInputHookField,
  CheckboxHookField,
  RadioGroupHookField,
  SelectHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

// ── Validation types ──────────────────────────────────────────────────

/**
 * The required-field error code emitted by every field of {@link useSignEmployeeForm}.
 *
 * @remarks
 * Use this as the `validationMessages` key for any sign-employee-form field.
 * See {@link SignEmployeeFormErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof SignEmployeeFormErrorCodes.REQUIRED

// ── Shared preparer field prop types ──────────────────────────────────

/**
 * Props accepted by the text-input preparer fields of {@link useSignEmployeeForm} (name, address, signature).
 *
 * @public
 */
export type PreparerTextFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>
/**
 * Props accepted by the state-select preparer field of {@link useSignEmployeeForm}.
 *
 * @public
 */
export type PreparerSelectFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, string>
>
/**
 * Props accepted by the confirmation checkbox preparer field of {@link useSignEmployeeForm}.
 *
 * @public
 */
export type PreparerCheckboxFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

// ── Base fields (always present) ──────────────────────────────────────

/**
 * Props accepted by {@link useSignEmployeeForm}'s `Fields.Signature` component.
 *
 * @public
 */
export type SignatureFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `signature` field of {@link useSignEmployeeForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Signature`. The employee types
 * their full legal name; required.
 *
 * @param props - {@link SignatureFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `signature`.
 * @public
 */
export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

/**
 * Props accepted by {@link useSignEmployeeForm}'s `Fields.ConfirmSignature` component.
 *
 * @public
 */
export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

/**
 * Checkbox bound to the `confirmSignature` field of {@link useSignEmployeeForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.ConfirmSignature`. Captures the
 * employee's electronic-signature consent; must be checked to submit.
 *
 * @param props - {@link ConfirmSignatureFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered checkbox bound to `confirmSignature`.
 * @public
 */
export function ConfirmSignatureField(props: ConfirmSignatureFieldProps) {
  return <CheckboxHookField {...props} name="confirmSignature" />
}

// ── I-9 fields ────────────────────────────────────────────────────────

/**
 * Props accepted by {@link useSignEmployeeForm}'s `Fields.UsedPreparer` component.
 *
 * @public
 */
export type UsedPreparerFieldProps = HookFieldProps<RadioGroupHookFieldProps<RequiredValidation>>

/**
 * Radio group bound to the `usedPreparer` field of {@link useSignEmployeeForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.UsedPreparer` only when the
 * form being signed is an I-9; `undefined` otherwise. Selecting `'yes'`
 * automatically reveals the first preparer field group; switching back to
 * `'no'` removes all preparer sections.
 *
 * @param props - {@link UsedPreparerFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered radio group bound to `usedPreparer`.
 * @public
 */
export function UsedPreparerField(props: UsedPreparerFieldProps) {
  return <RadioGroupHookField {...props} name="usedPreparer" />
}

// ── Preparer 1 fields ─────────────────────────────────────────────────

/**
 * Text input bound to the first preparer's first name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerFirstName`.
 * @public
 */
export function Preparer1FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerFirstName" />
}
/**
 * Text input bound to the first preparer's last name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerLastName`.
 * @public
 */
export function Preparer1LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerLastName" />
}
/**
 * Text input bound to the first preparer's street address line 1.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerStreet1`.
 * @public
 */
export function Preparer1Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerStreet1" />
}
/**
 * Text input bound to the first preparer's street address line 2 (optional).
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerStreet2`.
 * @public
 */
export function Preparer1Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerStreet2" />
}
/**
 * Text input bound to the first preparer's city.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerCity`.
 * @public
 */
export function Preparer1City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerCity" />
}
/**
 * Select bound to the first preparer's state. Options are US state abbreviations.
 *
 * @param props - {@link PreparerSelectFieldProps}.
 * @returns The rendered select bound to `preparerState`.
 * @public
 */
export function Preparer1State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparerState" />
}
/**
 * Text input bound to the first preparer's ZIP code.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerZip`.
 * @public
 */
export function Preparer1Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerZip" />
}
/**
 * Text input bound to the first preparer's typed signature.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparerSignature`.
 * @public
 */
export function Preparer1Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerSignature" />
}
/**
 * Checkbox bound to the first preparer's electronic-signature consent.
 *
 * @param props - {@link PreparerCheckboxFieldProps}.
 * @returns The rendered checkbox bound to `preparerAgree`.
 * @public
 */
export function Preparer1ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparerAgree" />
}

// ── Preparer 2 fields ─────────────────────────────────────────────────

/**
 * Text input bound to the second preparer's first name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2FirstName`.
 * @public
 */
export function Preparer2FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2FirstName" />
}
/**
 * Text input bound to the second preparer's last name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2LastName`.
 * @public
 */
export function Preparer2LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2LastName" />
}
/**
 * Text input bound to the second preparer's street address line 1.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2Street1`.
 * @public
 */
export function Preparer2Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Street1" />
}
/**
 * Text input bound to the second preparer's street address line 2 (optional).
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2Street2`.
 * @public
 */
export function Preparer2Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Street2" />
}
/**
 * Text input bound to the second preparer's city.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2City`.
 * @public
 */
export function Preparer2City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2City" />
}
/**
 * Select bound to the second preparer's state. Options are US state abbreviations.
 *
 * @param props - {@link PreparerSelectFieldProps}.
 * @returns The rendered select bound to `preparer2State`.
 * @public
 */
export function Preparer2State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer2State" />
}
/**
 * Text input bound to the second preparer's ZIP code.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2Zip`.
 * @public
 */
export function Preparer2Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Zip" />
}
/**
 * Text input bound to the second preparer's typed signature.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer2Signature`.
 * @public
 */
export function Preparer2Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Signature" />
}
/**
 * Checkbox bound to the second preparer's electronic-signature consent.
 *
 * @param props - {@link PreparerCheckboxFieldProps}.
 * @returns The rendered checkbox bound to `preparer2Agree`.
 * @public
 */
export function Preparer2ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer2Agree" />
}

// ── Preparer 3 fields ─────────────────────────────────────────────────

/**
 * Text input bound to the third preparer's first name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3FirstName`.
 * @public
 */
export function Preparer3FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3FirstName" />
}
/**
 * Text input bound to the third preparer's last name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3LastName`.
 * @public
 */
export function Preparer3LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3LastName" />
}
/**
 * Text input bound to the third preparer's street address line 1.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3Street1`.
 * @public
 */
export function Preparer3Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Street1" />
}
/**
 * Text input bound to the third preparer's street address line 2 (optional).
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3Street2`.
 * @public
 */
export function Preparer3Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Street2" />
}
/**
 * Text input bound to the third preparer's city.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3City`.
 * @public
 */
export function Preparer3City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3City" />
}
/**
 * Select bound to the third preparer's state. Options are US state abbreviations.
 *
 * @param props - {@link PreparerSelectFieldProps}.
 * @returns The rendered select bound to `preparer3State`.
 * @public
 */
export function Preparer3State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer3State" />
}
/**
 * Text input bound to the third preparer's ZIP code.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3Zip`.
 * @public
 */
export function Preparer3Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Zip" />
}
/**
 * Text input bound to the third preparer's typed signature.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer3Signature`.
 * @public
 */
export function Preparer3Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Signature" />
}
/**
 * Checkbox bound to the third preparer's electronic-signature consent.
 *
 * @param props - {@link PreparerCheckboxFieldProps}.
 * @returns The rendered checkbox bound to `preparer3Agree`.
 * @public
 */
export function Preparer3ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer3Agree" />
}

// ── Preparer 4 fields ─────────────────────────────────────────────────

/**
 * Text input bound to the fourth preparer's first name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4FirstName`.
 * @public
 */
export function Preparer4FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4FirstName" />
}
/**
 * Text input bound to the fourth preparer's last name.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4LastName`.
 * @public
 */
export function Preparer4LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4LastName" />
}
/**
 * Text input bound to the fourth preparer's street address line 1.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4Street1`.
 * @public
 */
export function Preparer4Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Street1" />
}
/**
 * Text input bound to the fourth preparer's street address line 2 (optional).
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4Street2`.
 * @public
 */
export function Preparer4Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Street2" />
}
/**
 * Text input bound to the fourth preparer's city.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4City`.
 * @public
 */
export function Preparer4City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4City" />
}
/**
 * Select bound to the fourth preparer's state. Options are US state abbreviations.
 *
 * @param props - {@link PreparerSelectFieldProps}.
 * @returns The rendered select bound to `preparer4State`.
 * @public
 */
export function Preparer4State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer4State" />
}
/**
 * Text input bound to the fourth preparer's ZIP code.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4Zip`.
 * @public
 */
export function Preparer4Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Zip" />
}
/**
 * Text input bound to the fourth preparer's typed signature.
 *
 * @param props - {@link PreparerTextFieldProps}.
 * @returns The rendered text input bound to `preparer4Signature`.
 * @public
 */
export function Preparer4Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Signature" />
}
/**
 * Checkbox bound to the fourth preparer's electronic-signature consent.
 *
 * @param props - {@link PreparerCheckboxFieldProps}.
 * @returns The rendered checkbox bound to `preparer4Agree`.
 * @public
 */
export function Preparer4ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer4Agree" />
}
