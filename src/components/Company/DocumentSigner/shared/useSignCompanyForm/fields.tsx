import type { SignCompanyFormErrorCodes } from './signCompanyFormSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import { TextInputHookField, CheckboxHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type RequiredValidation = typeof SignCompanyFormErrorCodes.REQUIRED

export type SignatureFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

export function SignatureField(props: SignatureFieldProps) {
  return <TextInputHookField {...props} name="signature" />
}

export type ConfirmSignatureFieldProps = HookFieldProps<CheckboxHookFieldProps<RequiredValidation>>

export function ConfirmSignatureField(props: ConfirmSignatureFieldProps) {
  return <CheckboxHookField {...props} name="confirmSignature" />
}
