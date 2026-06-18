import type { SignCompanyFormErrorCodes } from './signCompanyFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import { TextInputHookField, CheckboxHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The required-field error code emitted by every field of {@link useSignCompanyForm}.
 *
 * @remarks
 * Use this as the `validationMessages` key for any sign-company-form field.
 * See {@link SignCompanyFormErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof SignCompanyFormErrorCodes.REQUIRED

/**
 * Props accepted by {@link useSignCompanyForm}'s `Fields.Signature` component.
 *
 * @public
 */
export type SignatureFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `signature` field of {@link useSignCompanyForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Signature`. The signer types
 * their full legal name; always required.
 *
 * @param props - {@link SignatureFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `signature`.
 * @public
 */
export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

/**
 * Props accepted by {@link useSignCompanyForm}'s `Fields.ConfirmSignature` component.
 *
 * @public
 */
export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

/**
 * Checkbox bound to the `confirmSignature` field of {@link useSignCompanyForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.ConfirmSignature`. The checkbox
 * must be checked to submit; it captures consent to the form's terms.
 *
 * @param props - {@link ConfirmSignatureFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered checkbox bound to `confirmSignature`.
 * @public
 */
export function ConfirmSignatureField(props: ConfirmSignatureFieldProps) {
  return <CheckboxHookField {...props} name="confirmSignature" />
}
