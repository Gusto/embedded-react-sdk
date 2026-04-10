import type { TextInputHookFieldProps } from '../../form/fields/TextInputHookField'
import type { CheckboxHookFieldProps } from '../../form/fields/CheckboxHookField'
import { TextInputHookField, CheckboxHookField } from '../../form/fields'
import type { SignCompanyFormErrorCodes } from './signCompanyFormSchema'
import type { HookFieldProps } from '@/types/sdkHooks'

export type RequiredValidation = typeof SignCompanyFormErrorCodes.REQUIRED

export type SignatureFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

export function ConfirmSignatureField(props: ConfirmSignatureFieldProps) {
  return <CheckboxHookField {...props} name="confirmSignature" />
}
