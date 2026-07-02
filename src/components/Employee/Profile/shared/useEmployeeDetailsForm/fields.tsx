import type { EmployeeDetailsErrorCodes } from './employeeDetailsSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import type { SwitchHookFieldProps } from '@/partner-hook-utils/form/fields/SwitchHookField'
import {
  TextInputHookField,
  DatePickerHookField,
  SwitchHookField,
} from '@/partner-hook-utils/form/fields'
import { useFormFieldsMetadataContext } from '@/partner-hook-utils/form/FormFieldsMetadataContext'
import type { HookFieldProps } from '@/partner-hook-utils/types'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'

/**
 * The required-field error code produced by {@link useEmployeeDetailsForm} fields that only emit `REQUIRED`.
 *
 * @remarks
 * Used as the `validationMessages` key for the middle initial and date of
 * birth fields. See {@link EmployeeDetailsErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof EmployeeDetailsErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the name fields of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.FirstName` and
 * `Fields.LastName`. See {@link EmployeeDetailsErrorCodes} for the full
 * description of each code.
 *
 * @public
 */
export type NameValidation = (typeof EmployeeDetailsErrorCodes)['REQUIRED' | 'INVALID_NAME']

/**
 * Validation error codes emitted by the `email` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Email`. The `REQUIRED`
 * code fires when the email is empty and required — either because
 * self-onboarding is enabled or because the field was promoted via
 * `optionalFieldsToRequire`. See {@link EmployeeDetailsErrorCodes}.
 *
 * @public
 */
export type EmailValidation = (typeof EmployeeDetailsErrorCodes)['REQUIRED' | 'INVALID_EMAIL']

/**
 * The format-validation error code emitted by the `ssn` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Use as a key in `validationMessages` on `Fields.Ssn`. See
 * {@link EmployeeDetailsErrorCodes}.
 *
 * @public
 */
export type SsnValidation = typeof EmployeeDetailsErrorCodes.INVALID_SSN

/**
 * The required-field error code for the `ssn` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * The required rule is automatically waived when the employee already has
 * an SSN on file, even if `ssn` is included in `optionalFieldsToRequire`.
 *
 * @public
 */
export type SsnRequiredValidation = typeof EmployeeDetailsErrorCodes.REQUIRED

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.FirstName` component.
 *
 * @public
 */
export type FirstNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/** @internal */
export function FirstNameField(props: FirstNameFieldProps) {
  return <TextInputHookField {...props} name="firstName" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.MiddleInitial` component.
 *
 * @public
 */
export type MiddleInitialFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function MiddleInitialField(props: MiddleInitialFieldProps) {
  return <TextInputHookField {...props} name="middleInitial" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.LastName` component.
 *
 * @public
 */
export type LastNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/** @internal */
export function LastNameField(props: LastNameFieldProps) {
  return <TextInputHookField {...props} name="lastName" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.Email` component.
 *
 * @public
 */
export type EmailFieldProps = HookFieldProps<TextInputHookFieldProps<EmailValidation>>

/** @internal */
export function EmailField(props: EmailFieldProps) {
  return <TextInputHookField {...props} name="email" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.DateOfBirth` component.
 *
 * @public
 */
export type DateOfBirthFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/** @internal */
export function DateOfBirthField(props: DateOfBirthFieldProps) {
  return <DatePickerHookField {...props} name="dateOfBirth" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.Ssn` component.
 *
 * @public
 */
export type SsnFieldProps = HookFieldProps<
  TextInputHookFieldProps<SsnValidation, SsnRequiredValidation>
>

/** @internal */
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

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.SelfOnboarding` component.
 *
 * @public
 */
export type SelfOnboardingFieldProps = HookFieldProps<SwitchHookFieldProps>

/** @internal */
export function SelfOnboardingField(props: SelfOnboardingFieldProps) {
  return <SwitchHookField {...props} name="selfOnboarding" />
}
