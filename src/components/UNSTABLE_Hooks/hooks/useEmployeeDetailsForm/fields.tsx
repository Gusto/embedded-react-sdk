import type { HookFieldProps } from '../../form/types'
import type { TextInputHookFieldProps } from '../../form/fields/TextInputHookField'
import type { DatePickerHookFieldProps } from '../../form/fields/DatePickerHookField'
import type { SwitchHookFieldProps } from '../../form/fields/SwitchHookField'
import { TextInputHookField, DatePickerHookField, SwitchHookField } from '../../form/fields'
import { useFormFieldsMetadataContext } from '../../form/FormFieldsMetadataContext'
import type { EmployeeDetailsErrorCodes } from './employeeDetailsSchema'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'

export type RequiredValidation = typeof EmployeeDetailsErrorCodes.REQUIRED
export type NameValidation = (typeof EmployeeDetailsErrorCodes)['REQUIRED' | 'INVALID_NAME']
export type EmailValidation = (typeof EmployeeDetailsErrorCodes)[
  | 'REQUIRED'
  | 'INVALID_EMAIL'
  | 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING']
export type SsnValidation = typeof EmployeeDetailsErrorCodes.INVALID_SSN

export type FirstNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

export function FirstNameField(props: FirstNameFieldProps) {
  return <TextInputHookField {...props} name="firstName" />
}

export type MiddleInitialFieldProps = HookFieldProps<TextInputHookFieldProps>

export function MiddleInitialField(props: MiddleInitialFieldProps) {
  return <TextInputHookField {...props} name="middleInitial" />
}

export type LastNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

export function LastNameField(props: LastNameFieldProps) {
  return <TextInputHookField {...props} name="lastName" />
}

export type EmailFieldProps = HookFieldProps<TextInputHookFieldProps<EmailValidation>>

export function EmailField(props: EmailFieldProps) {
  return <TextInputHookField {...props} name="email" />
}

export type DateOfBirthFieldProps = HookFieldProps<DatePickerHookFieldProps>

export function DateOfBirthField(props: DateOfBirthFieldProps) {
  return <DatePickerHookField {...props} name="dateOfBirth" />
}

export type SsnFieldProps = HookFieldProps<TextInputHookFieldProps<SsnValidation>>

export function SsnField(props: SsnFieldProps) {
  const metadataContext = useFormFieldsMetadataContext()
  const metadata = props.formHookResult?.form.fieldsMetadata ?? metadataContext?.metadata ?? {}
  const placeholderSSN = usePlaceholderSSN(metadata.ssn?.hasRedactedValue)
  return (
    <TextInputHookField
      {...props}
      name="ssn"
      transform={normalizeSSN}
      placeholder={placeholderSSN}
    />
  )
}

export type SelfOnboardingFieldProps = HookFieldProps<SwitchHookFieldProps>

export function SelfOnboardingField(props: SelfOnboardingFieldProps) {
  return <SwitchHookField {...props} name="selfOnboarding" />
}
