import type { ComponentType } from 'react'
import type { ContractorSignatureFormErrorCodes } from './contractorSignatureFormSchema'
import { normalizeEinOrNotApplicable, normalizeSsnOrNotApplicable } from './w9Fields'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { CheckboxHookFieldProps } from '@/partner-hook-utils/form/fields/CheckboxHookField'
import type { RadioGroupHookFieldProps } from '@/partner-hook-utils/form/fields/RadioGroupHookField'
import type { SelectHookFieldProps } from '@/partner-hook-utils/form/fields/SelectHookField'
import {
  TextInputHookField,
  CheckboxHookField,
  RadioGroupHookField,
  SelectHookField,
} from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

/**
 * The form-field name of the electronic-signature consent checkbox.
 *
 * @internal
 */
export const AGREE_FIELD = 'agree'

// ── Shared prop types ─────────────────────────────────────────────────

/**
 * The required-field error code emitted by most {@link useContractorSignatureForm} fields.
 *
 * @remarks
 * Use as a key in `validationMessages` for text inputs, selects, and radio groups
 * that only emit the `REQUIRED` error. See {@link ContractorSignatureFormErrorCodes}.
 *
 * @public
 */
export type RequiredValidation = typeof ContractorSignatureFormErrorCodes.REQUIRED

/**
 * Validation error code emitted by the `Agree` consent checkbox.
 *
 * @remarks
 * Use as a key in `validationMessages` on `Fields.Agree`. See
 * {@link ContractorSignatureFormErrorCodes}.
 *
 * @public
 */
export type AgreeValidation = typeof ContractorSignatureFormErrorCodes.AGREE_REQUIRED

/**
 * The format-validation error code emitted by the `ssn` field of {@link useContractorSignatureForm}.
 *
 * @remarks
 * Use as a key in `validationMessages` on `Fields.Ssn`. See
 * {@link ContractorSignatureFormErrorCodes}.
 *
 * @public
 */
export type SsnValidation = typeof ContractorSignatureFormErrorCodes.INVALID_SSN

/**
 * The format-validation error code emitted by the `ein` field of {@link useContractorSignatureForm}.
 *
 * @remarks
 * Use as a key in `validationMessages` on `Fields.Ein`. See
 * {@link ContractorSignatureFormErrorCodes}.
 *
 * @public
 */
export type EinValidation = typeof ContractorSignatureFormErrorCodes.INVALID_EIN

// ── Field prop types ──────────────────────────────────────────────────

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.Name` component.
 *
 * @public
 */
export type NameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.TaxClassification` component.
 *
 * @public
 */
export type TaxClassificationFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, string>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.HomeAddressStreet1` component.
 *
 * @public
 */
export type HomeAddressStreet1FieldProps = HookFieldProps<
  TextInputHookFieldProps<RequiredValidation>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.HomeAddressCity` component.
 *
 * @public
 */
export type HomeAddressCityFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.HomeAddressState` component.
 *
 * @public
 */
export type HomeAddressStateFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.HomeAddressZip` component.
 *
 * @public
 */
export type HomeAddressZipFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.Ssn` component.
 *
 * @public
 */
export type SsnFieldProps = HookFieldProps<
  TextInputHookFieldProps<SsnValidation, RequiredValidation>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.Ein` component.
 *
 * @public
 */
export type EinFieldProps = HookFieldProps<
  TextInputHookFieldProps<EinValidation, RequiredValidation>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.SignatureText` component.
 *
 * @public
 */
export type SignatureTextFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.Agree` component.
 *
 * @public
 */
export type AgreeFieldProps = HookFieldProps<CheckboxHookFieldProps<AgreeValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.BusinessName` component.
 *
 * @public
 */
export type BusinessNameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.LlcClassificationCode` component.
 *
 * @public
 */
export type LlcClassificationCodeFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, string>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.OtherText` component.
 *
 * @public
 */
export type OtherTextFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.ForeignPartners` component.
 *
 * @public
 */
export type ForeignPartnersFieldProps = HookFieldProps<CheckboxHookFieldProps>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.ExemptPayeeCode` component.
 *
 * @public
 */
export type ExemptPayeeCodeFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.ExemptionFromFatca` component.
 *
 * @public
 */
export type ExemptionFromFatcaFieldProps = HookFieldProps<
  TextInputHookFieldProps<RequiredValidation>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.HomeAddressStreet2` component.
 *
 * @public
 */
export type HomeAddressStreet2FieldProps = HookFieldProps<
  TextInputHookFieldProps<RequiredValidation>
>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.AccountNumber` component.
 *
 * @public
 */
export type AccountNumberFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

/**
 * Props accepted by {@link useContractorSignatureForm}'s `Fields.CompanyName` component.
 *
 * @public
 */
export type CompanyNameFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

// ── Core fields (always present) ──────────────────────────────────────

/** @internal */
export function NameField(props: NameFieldProps) {
  return <TextInputHookField {...props} name="name" />
}

/** @internal */
export function TaxClassificationField(props: TaxClassificationFieldProps) {
  return <RadioGroupHookField {...props} name="taxClassification" />
}

/** @internal */
export function HomeAddressStreet1Field(props: HomeAddressStreet1FieldProps) {
  return <TextInputHookField {...props} name="homeAddressStreet1" />
}

/** @internal */
export function HomeAddressCityField(props: HomeAddressCityFieldProps) {
  return <TextInputHookField {...props} name="homeAddressCity" />
}

/** @internal */
export function HomeAddressStateField(props: HomeAddressStateFieldProps) {
  return <TextInputHookField {...props} name="homeAddressState" />
}

/** @internal */
export function HomeAddressZipField(props: HomeAddressZipFieldProps) {
  return <TextInputHookField {...props} name="homeAddressZip" />
}

/** @internal */
export function SsnField(props: SsnFieldProps) {
  return <TextInputHookField {...props} name="ssn" transform={normalizeSsnOrNotApplicable} />
}

/** @internal */
export function EinField(props: EinFieldProps) {
  return <TextInputHookField {...props} name="ein" transform={normalizeEinOrNotApplicable} />
}

/** @internal */
export function SignatureTextField(props: SignatureTextFieldProps) {
  return <TextInputHookField {...props} name="signatureText" />
}

/** @internal */
export function AgreeField(props: AgreeFieldProps) {
  return <CheckboxHookField {...props} name="agree" />
}

// ── Variable fields (rendered only when the API returns them) ─────────

/** @internal */
export function BusinessNameField(props: BusinessNameFieldProps) {
  return <TextInputHookField {...props} name="businessName" />
}

/** @internal */
export function LlcClassificationCodeField(props: LlcClassificationCodeFieldProps) {
  return <SelectHookField {...props} name="llcClassificationCode" />
}

/** @internal */
export function OtherTextField(props: OtherTextFieldProps) {
  return <TextInputHookField {...props} name="otherText" />
}

/** @internal */
export function ForeignPartnersField(props: ForeignPartnersFieldProps) {
  return <CheckboxHookField {...props} name="foreignPartners" />
}

/** @internal */
export function ExemptPayeeCodeField(props: ExemptPayeeCodeFieldProps) {
  return <TextInputHookField {...props} name="exemptPayeeCode" />
}

/** @internal */
export function ExemptionFromFatcaField(props: ExemptionFromFatcaFieldProps) {
  return <TextInputHookField {...props} name="exemptionFromFatca" />
}

/** @internal */
export function HomeAddressStreet2Field(props: HomeAddressStreet2FieldProps) {
  return <TextInputHookField {...props} name="homeAddressStreet2" />
}

/** @internal */
export function AccountNumberField(props: AccountNumberFieldProps) {
  return <TextInputHookField {...props} name="accountNumber" />
}

/** @internal */
export function CompanyNameField(props: CompanyNameFieldProps) {
  return <TextInputHookField {...props} name="companyName" />
}

/**
 * Field components exposed by {@link useContractorSignatureForm} on `form.Fields`.
 *
 * @remarks
 * Every field is presence-gated against the API response and is `undefined`
 * when the document didn't return its backing field — always null-check before
 * rendering. This guards against the document API diverging (dropping or
 * renaming a field) by skipping fields it no longer returns, mirroring the
 * stable signing flow. `Agree` is the sole exception: it's a synthesized
 * electronic-signature consent checkbox with no API field, so it's always
 * present.
 *
 * @public
 */
export interface ContractorSignatureFormFieldComponents {
  /** Entity or individual name; defined only when the API returns `name`. */
  Name: ComponentType<NameFieldProps> | undefined
  /** Federal tax classification radio group; defined only when the document carries classification checkboxes. */
  TaxClassification: ComponentType<TaxClassificationFieldProps> | undefined
  /** Street address line 1; defined only when the API returns `home_address_street_1`. */
  HomeAddressStreet1: ComponentType<HomeAddressStreet1FieldProps> | undefined
  /** City; defined only when the API returns `home_address_city`. */
  HomeAddressCity: ComponentType<HomeAddressCityFieldProps> | undefined
  /** State; defined only when the API returns `home_address_state`. */
  HomeAddressState: ComponentType<HomeAddressStateFieldProps> | undefined
  /** ZIP code; defined only when the API returns `home_address_zip`. */
  HomeAddressZip: ComponentType<HomeAddressZipFieldProps> | undefined
  /** Social Security Number; defined only when the API returns `ssn`. */
  Ssn: ComponentType<SsnFieldProps> | undefined
  /** Employer Identification Number; defined only when the API returns `ein`. */
  Ein: ComponentType<EinFieldProps> | undefined
  /** Typed signature; defined only when the API returns `signature_text`. */
  SignatureText: ComponentType<SignatureTextFieldProps> | undefined
  /** Electronic-signature consent checkbox; always present (synthesized, not an API field). */
  Agree: ComponentType<AgreeFieldProps>
  /** Business name; defined only when the API returns `business_name`. */
  BusinessName: ComponentType<BusinessNameFieldProps> | undefined
  /** LLC tax classification code select; defined only when classification checkboxes are present. */
  LlcClassificationCode: ComponentType<LlcClassificationCodeFieldProps> | undefined
  /** "Other" free-text classification; defined only when the API returns `other_text`. */
  OtherText: ComponentType<OtherTextFieldProps> | undefined
  /** Foreign partners checkbox; defined only when the API returns `foreign_partners`. */
  ForeignPartners: ComponentType<ForeignPartnersFieldProps> | undefined
  /** Exempt payee code; defined only when the API returns `exempt_payee_code`. */
  ExemptPayeeCode: ComponentType<ExemptPayeeCodeFieldProps> | undefined
  /** FATCA exemption code; defined only when the API returns `exemption_from_FATCA`. */
  ExemptionFromFatca: ComponentType<ExemptionFromFatcaFieldProps> | undefined
  /** Street address line 2; defined only when the API returns `home_address_street_2`. */
  HomeAddressStreet2: ComponentType<HomeAddressStreet2FieldProps> | undefined
  /** Account number(s); defined only when the API returns `account_number`. */
  AccountNumber: ComponentType<AccountNumberFieldProps> | undefined
  /** Requester's name and address; defined only when the API returns `company_name`. */
  CompanyName: ComponentType<CompanyNameFieldProps> | undefined
}
