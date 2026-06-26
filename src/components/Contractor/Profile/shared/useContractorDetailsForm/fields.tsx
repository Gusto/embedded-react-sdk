import type {
  ContractorDetailsErrorCodes,
  ContractorDetailsFormData,
} from './contractorDetailsSchema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { NumberInputHookFieldProps } from '@/partner-hook-utils/form/fields/NumberInputHookField'
import type { DatePickerHookFieldProps } from '@/partner-hook-utils/form/fields/DatePickerHookField'
import type { SwitchHookFieldProps } from '@/partner-hook-utils/form/fields/SwitchHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import {
  TextInputHookField,
  NumberInputHookField,
  DatePickerHookField,
  SwitchHookField,
  RadioGroupHookField,
  SelectHookField,
} from '@/partner-hook-utils/form/fields'
import { useFormFieldsMetadataContext } from '@/partner-hook-utils/form/FormFieldsMetadataContext'
import type { HookFieldProps } from '@/partner-hook-utils/types'
import { normalizeSSN, usePlaceholderSSN } from '@/helpers/ssn'
import { normalizeEin, usePlaceholderEin } from '@/helpers/federalEin'

/**
 * Error code emitted by fields of {@link useContractorDetailsForm} that only
 * produce `REQUIRED`.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorDetailsErrorCodes.REQUIRED

/**
 * Validation error codes emitted by the name fields of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type NameValidation = (typeof ContractorDetailsErrorCodes)['REQUIRED' | 'INVALID_NAME']

/**
 * Validation error codes emitted by the `email` field of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type EmailValidation = (typeof ContractorDetailsErrorCodes)['REQUIRED' | 'INVALID_EMAIL']

/**
 * Format-validation error code emitted by the `ssn` field of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type SsnValidation = typeof ContractorDetailsErrorCodes.INVALID_SSN

/**
 * Required-field error code emitted by the `ssn` field of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type SsnRequiredValidation = typeof ContractorDetailsErrorCodes.REQUIRED

/**
 * Format-validation error code emitted by the `ein` field of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type EinValidation = typeof ContractorDetailsErrorCodes.INVALID_EIN

/**
 * Required-field error code emitted by the `ein` field of {@link useContractorDetailsForm}.
 *
 * @public
 */
export type EinRequiredValidation = typeof ContractorDetailsErrorCodes.REQUIRED

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.Type` component.
 *
 * @public
 */
export type TypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, ContractorDetailsFormData['type']>
>

/**
 * Radio group bound to the `type` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Selects whether the contractor is an `Individual` or a `Business`. Provide
 * `getOptionLabel` to localize the option labels.
 *
 * @param props - {@link TypeFieldProps}.
 * @returns The rendered radio group bound to `type`.
 * @public
 */
export function TypeField(props: TypeFieldProps) {
  return <RadioGroupHookField {...props} name="type" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.WageType` component.
 *
 * @public
 */
export type WageTypeFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<never, ContractorDetailsFormData['wageType']>
>

/**
 * Radio group bound to the `wageType` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Selects whether the contractor is paid `Fixed` or `Hourly`. Provide
 * `getOptionLabel` to localize the option labels.
 *
 * @param props - {@link WageTypeFieldProps}.
 * @returns The rendered radio group bound to `wageType`.
 * @public
 */
export function WageTypeField(props: WageTypeFieldProps) {
  return <RadioGroupHookField {...props} name="wageType" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.StartDate` component.
 *
 * @public
 */
export type StartDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/**
 * Date picker bound to the `startDate` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Required on create; can be made required on update via
 * `optionalFieldsToRequire`.
 *
 * @param props - {@link StartDateFieldProps}.
 * @returns The rendered date picker bound to `startDate`.
 * @public
 */
export function StartDateField(props: StartDateFieldProps) {
  return <DatePickerHookField {...props} name="startDate" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.HourlyRate` component.
 *
 * @public
 */
export type HourlyRateFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

/**
 * Number input bound to the `hourlyRate` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.HourlyRate` only when
 * `wageType` is `Hourly`, in which case it is required.
 *
 * @param props - {@link HourlyRateFieldProps}.
 * @returns The rendered number input bound to `hourlyRate`.
 * @public
 */
export function HourlyRateField(props: HourlyRateFieldProps) {
  return <NumberInputHookField {...props} name="hourlyRate" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.SelfOnboarding` component.
 *
 * @public
 */
export type SelfOnboardingFieldProps = HookFieldProps<SwitchHookFieldProps>

/**
 * Switch bound to the `selfOnboarding` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.SelfOnboarding` only when the
 * field is toggleable (create mode, or an onboarding status that still allows
 * inviting the contractor). Always null-check before rendering. When enabled,
 * the contractor is invited to enter their own details and SSN/EIN are no
 * longer collected by the admin.
 *
 * @param props - {@link SelfOnboardingFieldProps}.
 * @returns The rendered switch bound to `selfOnboarding`.
 * @public
 */
export function SelfOnboardingField(props: SelfOnboardingFieldProps) {
  return <SwitchHookField {...props} name="selfOnboarding" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.FileNewHireReport` component.
 *
 * @public
 */
export type FileNewHireReportFieldProps = HookFieldProps<SwitchHookFieldProps>

/**
 * Switch bound to the `fileNewHireReport` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.FileNewHireReport` only for
 * individual contractors. When enabled, a work state must be supplied so the
 * new-hire report can be filed.
 *
 * @param props - {@link FileNewHireReportFieldProps}.
 * @returns The rendered switch bound to `fileNewHireReport`.
 * @public
 */
export function FileNewHireReportField(props: FileNewHireReportFieldProps) {
  return <SwitchHookField {...props} name="fileNewHireReport" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.Email` component.
 *
 * @public
 */
export type EmailFieldProps = HookFieldProps<TextInputHookFieldProps<EmailValidation>>

/**
 * Text input bound to the `email` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Email` only when
 * self-onboarding is enabled, in which case it is required (reported via the
 * `REQUIRED` code).
 *
 * @param props - {@link EmailFieldProps}.
 * @returns The rendered text input bound to `email`.
 * @public
 */
export function EmailField(props: EmailFieldProps) {
  return <TextInputHookField {...props} name="email" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.FirstName` component.
 *
 * @public
 */
export type FirstNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/**
 * Text input bound to the `firstName` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.FirstName` for individual
 * contractors, in which case it is required.
 *
 * @param props - {@link FirstNameFieldProps}.
 * @returns The rendered text input bound to `firstName`.
 * @public
 */
export function FirstNameField(props: FirstNameFieldProps) {
  return <TextInputHookField {...props} name="firstName" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.LastName` component.
 *
 * @public
 */
export type LastNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/**
 * Text input bound to the `lastName` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.LastName` for individual
 * contractors, in which case it is required.
 *
 * @param props - {@link LastNameFieldProps}.
 * @returns The rendered text input bound to `lastName`.
 * @public
 */
export function LastNameField(props: LastNameFieldProps) {
  return <TextInputHookField {...props} name="lastName" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.MiddleInitial` component.
 *
 * @public
 */
export type MiddleInitialFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `middleInitial` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.MiddleInitial` for individual
 * contractors. Always optional.
 *
 * @param props - {@link MiddleInitialFieldProps}.
 * @returns The rendered text input bound to `middleInitial`.
 * @public
 */
export function MiddleInitialField(props: MiddleInitialFieldProps) {
  return <TextInputHookField {...props} name="middleInitial" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.BusinessName` component.
 *
 * @public
 */
export type BusinessNameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Text input bound to the `businessName` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.BusinessName` for business
 * contractors, in which case it is required.
 *
 * @param props - {@link BusinessNameFieldProps}.
 * @returns The rendered text input bound to `businessName`.
 * @public
 */
export function BusinessNameField(props: BusinessNameFieldProps) {
  return <TextInputHookField {...props} name="businessName" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.Ssn` component.
 *
 * @public
 */
export type SsnFieldProps = HookFieldProps<
  TextInputHookFieldProps<SsnValidation, SsnRequiredValidation>
>

/**
 * Text input bound to the `ssn` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Ssn` for individual contractors.
 * Auto-formats input with dashes (`XXX-XX-XXXX`). When the contractor already
 * has an SSN on file, the field shows a masked placeholder and the required
 * rule is waived.
 *
 * @param props - {@link SsnFieldProps}.
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
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.Ein` component.
 *
 * @public
 */
export type EinFieldProps = HookFieldProps<
  TextInputHookFieldProps<EinValidation, EinRequiredValidation>
>

/**
 * Text input bound to the `ein` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Ein` for business contractors.
 * Auto-formats input as `XX-XXXXXXX`. When the contractor already has an EIN on
 * file, the field shows a masked placeholder and the required rule is waived.
 *
 * @param props - {@link EinFieldProps}.
 * @returns The rendered text input bound to `ein`.
 * @public
 */
export function EinField(props: EinFieldProps) {
  const metadataContext = useFormFieldsMetadataContext()
  const metadata = props.formHookResult?.form.fieldsMetadata ?? metadataContext?.metadata ?? {}
  const placeholderEin = usePlaceholderEin(metadata.ein?.hasRedactedValue)
  return (
    <TextInputHookField
      {...props}
      name="ein"
      transform={normalizeEin}
      placeholder={placeholderEin}
    />
  )
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.WorkState` component.
 *
 * @public
 */
export type WorkStateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, string>>

/**
 * Select bound to the `workState` field of {@link useContractorDetailsForm}.
 *
 * @remarks
 * Available on the hook result as `form.Fields.WorkState` for individual
 * contractors when `fileNewHireReport` is enabled, in which case it is
 * required.
 *
 * @param props - {@link WorkStateFieldProps}.
 * @returns The rendered select bound to `workState`.
 * @public
 */
export function WorkStateField(props: WorkStateFieldProps) {
  return <SelectHookField {...props} name="workState" />
}
