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

/** @internal */
export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

/**
 * Props accepted by {@link useSignCompanyForm}'s `Fields.ConfirmSignature` component.
 *
 * @public
 */
export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

/** @internal */
export function ConfirmSignatureField(props: ConfirmSignatureFieldProps) {
  return <CheckboxHookField {...props} name="confirmSignature" />
}
