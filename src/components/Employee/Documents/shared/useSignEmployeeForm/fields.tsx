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

/** @internal */
export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

/**
 * Props accepted by {@link useSignEmployeeForm}'s `Fields.ConfirmSignature` component.
 *
 * @public
 */
export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

/** @internal */
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

/** @internal */
export function UsedPreparerField(props: UsedPreparerFieldProps) {
  return <RadioGroupHookField {...props} name="usedPreparer" />
}

// ── Preparer 1 fields ─────────────────────────────────────────────────

/** @internal */
export function Preparer1FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerFirstName" />
}
/** @internal */
export function Preparer1LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerLastName" />
}
/** @internal */
export function Preparer1Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerStreet1" />
}
/** @internal */
export function Preparer1Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerStreet2" />
}
/** @internal */
export function Preparer1City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerCity" />
}
/** @internal */
export function Preparer1State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparerState" />
}
/** @internal */
export function Preparer1Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerZip" />
}
/** @internal */
export function Preparer1Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerSignature" />
}
/** @internal */
export function Preparer1ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparerAgree" />
}

// ── Preparer 2 fields ─────────────────────────────────────────────────

/** @internal */
export function Preparer2FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2FirstName" />
}
/** @internal */
export function Preparer2LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2LastName" />
}
/** @internal */
export function Preparer2Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Street1" />
}
/** @internal */
export function Preparer2Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Street2" />
}
/** @internal */
export function Preparer2City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2City" />
}
/** @internal */
export function Preparer2State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer2State" />
}
/** @internal */
export function Preparer2Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Zip" />
}
/** @internal */
export function Preparer2Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Signature" />
}
/** @internal */
export function Preparer2ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer2Agree" />
}

// ── Preparer 3 fields ─────────────────────────────────────────────────

/** @internal */
export function Preparer3FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3FirstName" />
}
/** @internal */
export function Preparer3LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3LastName" />
}
/** @internal */
export function Preparer3Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Street1" />
}
/** @internal */
export function Preparer3Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Street2" />
}
/** @internal */
export function Preparer3City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3City" />
}
/** @internal */
export function Preparer3State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer3State" />
}
/** @internal */
export function Preparer3Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Zip" />
}
/** @internal */
export function Preparer3Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Signature" />
}
/** @internal */
export function Preparer3ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer3Agree" />
}

// ── Preparer 4 fields ─────────────────────────────────────────────────

/** @internal */
export function Preparer4FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4FirstName" />
}
/** @internal */
export function Preparer4LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4LastName" />
}
/** @internal */
export function Preparer4Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Street1" />
}
/** @internal */
export function Preparer4Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Street2" />
}
/** @internal */
export function Preparer4City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4City" />
}
/** @internal */
export function Preparer4State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer4State" />
}
/** @internal */
export function Preparer4Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Zip" />
}
/** @internal */
export function Preparer4Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Signature" />
}
/** @internal */
export function Preparer4ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer4Agree" />
}
