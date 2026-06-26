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
 * @group Utility Types
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
 * @group Utility Types
 */
export type NameValidation = (typeof EmployeeDetailsErrorCodes)['REQUIRED' | 'INVALID_NAME']

/**
 * Validation error codes emitted by the `email` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Use these as keys in `validationMessages` on `Fields.Email`. The
 * `EMAIL_REQUIRED_FOR_SELF_ONBOARDING` code fires when self-onboarding is
 * enabled but the email is empty (create mode only). See
 * {@link EmployeeDetailsErrorCodes}.
 *
 * @public
 */
export type EmailValidation = (typeof EmployeeDetailsErrorCodes)[
  | 'REQUIRED'
  | 'INVALID_EMAIL'
  | 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING']

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

/**
 * Text input bound to the `firstName` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.FirstName`. Required on
 * create; can be made required on update via `optionalFieldsToRequire`.
 *
 * @param props - {@link FirstNameFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `firstName`.
 * @public
 */
export function FirstNameField(props: FirstNameFieldProps) {
  return <TextInputHookField {...props} name="firstName" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.MiddleInitial` component.
 *
 * @public
 */
export type MiddleInitialFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `middleInitial` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.MiddleInitial`. Always
 * optional.
 *
 * @param props - {@link MiddleInitialFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `middleInitial`.
 * @public
 */
export function MiddleInitialField(props: MiddleInitialFieldProps) {
  return <TextInputHookField {...props} name="middleInitial" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.LastName` component.
 *
 * @public
 */
export type LastNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/**
 * Text input bound to the `lastName` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.LastName`. Required on
 * create; can be made required on update via `optionalFieldsToRequire`.
 *
 * @param props - {@link LastNameFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `lastName`.
 * @public
 */
export function LastNameField(props: LastNameFieldProps) {
  return <TextInputHookField {...props} name="lastName" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.Email` component.
 *
 * @public
 */
export type EmailFieldProps = HookFieldProps<TextInputHookFieldProps<EmailValidation>>

/**
 * Text input bound to the `email` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Email`. Optional by default
 * — opt in via `optionalFieldsToRequire`. Also enforces a required rule
 * whenever the self-onboarding toggle is enabled in create mode, reported
 * via the `EMAIL_REQUIRED_FOR_SELF_ONBOARDING` code.
 *
 * @param props - {@link EmailFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `email`.
 * @public
 */
export function EmailField(props: EmailFieldProps) {
  return <TextInputHookField {...props} name="email" />
}

/**
 * Props accepted by {@link useEmployeeDetailsForm}'s `Fields.DateOfBirth` component.
 *
 * @public
 */
export type DateOfBirthFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/**
 * Date picker bound to the `dateOfBirth` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.DateOfBirth`. Optional by
 * default — opt in via `optionalFieldsToRequire`.
 *
 * @param props - {@link DateOfBirthFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered date picker bound to `dateOfBirth`.
 * @public
 */
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

/**
 * Text input bound to the `ssn` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Ssn`. Auto-formats input
 * with dashes (`XXX-XX-XXXX`). When the employee already has an SSN on
 * file, the field shows a masked placeholder and the required rule is
 * automatically waived even if `ssn` is listed in
 * `optionalFieldsToRequire`.
 *
 * @param props - {@link SsnFieldProps} — accepts the standard hook field props (label, description, validationMessages, FieldComponent override).
 * @returns The rendered text input bound to `ssn`.
 * @public
 */
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

/**
 * Switch bound to the `selfOnboarding` field of {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.SelfOnboarding` when the
 * field is toggleable. The field is `undefined` when
 * `withSelfOnboardingField` is `false`, or when the employee's
 * onboarding status no longer allows toggling (e.g. self-onboarding is
 * already in progress or completed). Always null-check before rendering.
 * When enabled, the employee receives an invitation to enter their own
 * personal, tax, and banking details.
 *
 * @param props - {@link SelfOnboardingFieldProps} — accepts the standard hook field props (label, description, FieldComponent override).
 * @returns The rendered switch bound to `selfOnboarding`.
 * @public
 */
export function SelfOnboardingField(props: SelfOnboardingFieldProps) {
  return <SwitchHookField {...props} name="selfOnboarding" />
}
