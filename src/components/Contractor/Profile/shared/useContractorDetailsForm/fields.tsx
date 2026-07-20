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

/** @internal */
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

/** @internal */
export function WageTypeField(props: WageTypeFieldProps) {
  return <RadioGroupHookField {...props} name="wageType" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.StartDate` component.
 *
 * @public
 */
export type StartDateFieldProps = HookFieldProps<DatePickerHookFieldProps<RequiredValidation>>

/** @internal */
export function StartDateField(props: StartDateFieldProps) {
  return <DatePickerHookField {...props} name="startDate" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.HourlyRate` component.
 *
 * @public
 */
export type HourlyRateFieldProps = HookFieldProps<NumberInputHookFieldProps<RequiredValidation>>

/** @internal */
export function HourlyRateField(props: HourlyRateFieldProps) {
  return <NumberInputHookField {...props} name="hourlyRate" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.SelfOnboarding` component.
 *
 * @public
 */
export type SelfOnboardingFieldProps = HookFieldProps<SwitchHookFieldProps>

/** @internal */
export function SelfOnboardingField(props: SelfOnboardingFieldProps) {
  return <SwitchHookField {...props} name="selfOnboarding" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.FileNewHireReport` component.
 *
 * @public
 */
export type FileNewHireReportFieldProps = HookFieldProps<SwitchHookFieldProps>

/** @internal */
export function FileNewHireReportField(props: FileNewHireReportFieldProps) {
  return <SwitchHookField {...props} name="fileNewHireReport" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.Email` component.
 *
 * @public
 */
export type EmailFieldProps = HookFieldProps<TextInputHookFieldProps<EmailValidation>>

/** @internal */
export function EmailField(props: EmailFieldProps) {
  return <TextInputHookField {...props} name="email" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.FirstName` component.
 *
 * @public
 */
export type FirstNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/** @internal */
export function FirstNameField(props: FirstNameFieldProps) {
  return <TextInputHookField {...props} name="firstName" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.LastName` component.
 *
 * @public
 */
export type LastNameFieldProps = HookFieldProps<TextInputHookFieldProps<NameValidation>>

/** @internal */
export function LastNameField(props: LastNameFieldProps) {
  return <TextInputHookField {...props} name="lastName" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.MiddleInitial` component.
 *
 * @public
 */
export type MiddleInitialFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
export function MiddleInitialField(props: MiddleInitialFieldProps) {
  return <TextInputHookField {...props} name="middleInitial" />
}

/**
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.BusinessName` component.
 *
 * @public
 */
export type BusinessNameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/** @internal */
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
 * Props accepted by {@link useContractorDetailsForm}'s `Fields.Ein` component.
 *
 * @public
 */
export type EinFieldProps = HookFieldProps<
  TextInputHookFieldProps<EinValidation, EinRequiredValidation>
>

/** @internal */
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

/** @internal */
export function WorkStateField(props: WorkStateFieldProps) {
  return <SelectHookField {...props} name="workState" />
}
