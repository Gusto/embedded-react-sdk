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

export type RequiredValidation = typeof SignEmployeeFormErrorCodes.REQUIRED

// ── Shared preparer field prop types ──────────────────────────────────

export type PreparerTextFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>
export type PreparerSelectFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, string>
>
export type PreparerCheckboxFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

// ── Base fields (always present) ──────────────────────────────────────

export type SignatureFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

export function ConfirmSignatureField(props: ConfirmSignatureFieldProps) {
  return <CheckboxHookField {...props} name="confirmSignature" />
}

// ── I-9 fields ────────────────────────────────────────────────────────

export type UsedPreparerFieldProps = HookFieldProps<RadioGroupHookFieldProps<RequiredValidation>>

export function UsedPreparerField(props: UsedPreparerFieldProps) {
  return <RadioGroupHookField {...props} name="usedPreparer" />
}

// ── Preparer 1 fields ─────────────────────────────────────────────────

export function Preparer1FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerFirstName" />
}
export function Preparer1LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerLastName" />
}
export function Preparer1Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerStreet1" />
}
export function Preparer1Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerStreet2" />
}
export function Preparer1City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerCity" />
}
export function Preparer1State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparerState" />
}
export function Preparer1Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerZip" />
}
export function Preparer1Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparerSignature" />
}
export function Preparer1ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparerAgree" />
}

// ── Preparer 2 fields ─────────────────────────────────────────────────

export function Preparer2FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2FirstName" />
}
export function Preparer2LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2LastName" />
}
export function Preparer2Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Street1" />
}
export function Preparer2Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Street2" />
}
export function Preparer2City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2City" />
}
export function Preparer2State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer2State" />
}
export function Preparer2Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Zip" />
}
export function Preparer2Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer2Signature" />
}
export function Preparer2ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer2Agree" />
}

// ── Preparer 3 fields ─────────────────────────────────────────────────

export function Preparer3FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3FirstName" />
}
export function Preparer3LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3LastName" />
}
export function Preparer3Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Street1" />
}
export function Preparer3Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Street2" />
}
export function Preparer3City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3City" />
}
export function Preparer3State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer3State" />
}
export function Preparer3Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Zip" />
}
export function Preparer3Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer3Signature" />
}
export function Preparer3ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer3Agree" />
}

// ── Preparer 4 fields ─────────────────────────────────────────────────

export function Preparer4FirstName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4FirstName" />
}
export function Preparer4LastName(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4LastName" />
}
export function Preparer4Street1(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Street1" />
}
export function Preparer4Street2(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Street2" />
}
export function Preparer4City(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4City" />
}
export function Preparer4State(props: PreparerSelectFieldProps) {
  return <SelectHookField {...props} name="preparer4State" />
}
export function Preparer4Zip(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Zip" />
}
export function Preparer4Signature(props: PreparerTextFieldProps) {
  return <TextInputHookField {...props} name="preparer4Signature" />
}
export function Preparer4ConfirmSignature(props: PreparerCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="preparer4Agree" />
}
