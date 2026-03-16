import type { ReactNode, ComponentType } from 'react'
import { useFormContext } from 'react-hook-form'
import type { EmployeeDetailsFormData } from './schema'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import { TextInputField } from '@/components/Common/Fields/TextInputField/TextInputField'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField/DatePickerField'
import { SwitchField } from '@/components/Common/Fields/SwitchField/SwitchField'

interface FieldProps {
  label: ReactNode
  description?: ReactNode
  placeholder?: string
}

interface FieldPropsWithValidations<TValidationKeys extends string> extends FieldProps {
  validationMessages: Record<TValidationKeys, string>
}

type NameValidation = 'REQUIRED' | 'INVALID_NAME'
type EmailValidation = 'INVALID_EMAIL'
type DateValidation = 'REQUIRED'

function useFieldErrorMessage<TKeys extends string>(
  fieldName: keyof EmployeeDetailsFormData,
  validationMessages: Record<TKeys, string>,
): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<EmployeeDetailsFormData>()
  const errorCode = errors[fieldName]?.message as TKeys | undefined
  return errorCode ? validationMessages[errorCode] : undefined
}

export type FirstNameFieldProps = FieldPropsWithValidations<NameValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function FirstName({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: FirstNameFieldProps) {
  const errorMessage = useFieldErrorMessage('firstName', validationMessages)

  return (
    <TextInputField
      name="firstName"
      isRequired
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      FieldComponent={FieldComponent}
    />
  )
}

export type MiddleInitialFieldProps = FieldProps & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function MiddleInitial({
  label,
  description,
  placeholder,
  FieldComponent,
}: MiddleInitialFieldProps) {
  return (
    <TextInputField
      name="middleInitial"
      label={label}
      description={description}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
    />
  )
}

export type LastNameFieldProps = FieldPropsWithValidations<NameValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function LastName({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: LastNameFieldProps) {
  const errorMessage = useFieldErrorMessage('lastName', validationMessages)

  return (
    <TextInputField
      name="lastName"
      isRequired
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      FieldComponent={FieldComponent}
    />
  )
}

export type PreferredFirstNameFieldProps = FieldProps & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function PreferredFirstName({
  label,
  description,
  placeholder,
  FieldComponent,
}: PreferredFirstNameFieldProps) {
  return (
    <TextInputField
      name="preferredFirstName"
      label={label}
      description={description}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
    />
  )
}

export type EmailFieldProps = FieldPropsWithValidations<EmailValidation> & {
  FieldComponent?: ComponentType<TextInputProps>
}

export function Email({
  label,
  description,
  placeholder,
  validationMessages,
  FieldComponent,
}: EmailFieldProps) {
  const errorMessage = useFieldErrorMessage('email', validationMessages)

  return (
    <TextInputField
      name="email"
      label={label}
      description={description}
      placeholder={placeholder}
      errorMessage={errorMessage}
      type="email"
      FieldComponent={FieldComponent}
    />
  )
}

export type DateOfBirthFieldProps = FieldPropsWithValidations<DateValidation> & {
  FieldComponent?: ComponentType<DatePickerProps>
}

export function DateOfBirth({ label, description, validationMessages }: DateOfBirthFieldProps) {
  const errorMessage = useFieldErrorMessage('dateOfBirth', validationMessages)

  return (
    <DatePickerField
      name="dateOfBirth"
      label={typeof label === 'string' ? label : ''}
      description={description}
      errorMessage={errorMessage}
    />
  )
}

export interface SelfOnboardingFieldProps {
  label: string
  description?: ReactNode
}

export function SelfOnboarding({ label, description }: SelfOnboardingFieldProps) {
  return <SwitchField name="selfOnboarding" label={label} description={description} />
}

export interface EmployeeDetailsFieldComponents {
  FirstName: typeof FirstName
  MiddleInitial: typeof MiddleInitial
  LastName: typeof LastName
  PreferredFirstName: typeof PreferredFirstName
  Email: typeof Email
  DateOfBirth: typeof DateOfBirth | undefined
  SelfOnboarding: typeof SelfOnboarding | undefined
}
