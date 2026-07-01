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

/** The required-field error code emitted by the W-9 input fields. */
type RequiredValidation = typeof ContractorSignatureFormErrorCodes.REQUIRED
/** The consent error code emitted only by the `agree` checkbox. */
type AgreeValidation = typeof ContractorSignatureFormErrorCodes.AGREE_REQUIRED
/** The format error code emitted only by the `ssn` field. */
type SsnValidation = typeof ContractorSignatureFormErrorCodes.INVALID_SSN
/** The format error code emitted only by the `ein` field. */
type EinValidation = typeof ContractorSignatureFormErrorCodes.INVALID_EIN

/**
 * Props accepted by the text-input fields of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureTextFieldProps = HookFieldProps<
  TextInputHookFieldProps<RequiredValidation>
>

/**
 * Props accepted by the `ForeignPartners` checkbox of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureCheckboxFieldProps = HookFieldProps<CheckboxHookFieldProps>

/**
 * Props accepted by the `Agree` consent checkbox of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureAgreeFieldProps = HookFieldProps<
  CheckboxHookFieldProps<AgreeValidation>
>

/**
 * Props accepted by the radio-group field of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureRadioFieldProps = HookFieldProps<
  RadioGroupHookFieldProps<RequiredValidation, string>
>

/**
 * Props accepted by the select field of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureSelectFieldProps = HookFieldProps<
  SelectHookFieldProps<RequiredValidation, string>
>

/**
 * Props accepted by the `Ssn` field of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureSsnFieldProps = HookFieldProps<
  TextInputHookFieldProps<SsnValidation, RequiredValidation>
>

/**
 * Props accepted by the `Ein` field of {@link useContractorSignatureForm}.
 *
 * @public
 */
export type ContractorSignatureEinFieldProps = HookFieldProps<
  TextInputHookFieldProps<EinValidation, RequiredValidation>
>

// ── Core fields (always present) ──────────────────────────────────────

/**
 * Text input bound to the `name` field (W-9 line 1, entity or individual name).
 *
 * @remarks
 * Available on the hook result as `form.Fields.Name` only when the API returns
 * `name`; `undefined` otherwise — null-check before rendering.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `name`.
 * @public
 */
export function NameField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="name" />
}

/**
 * Radio group bound to the synthesized `taxClassification` field (W-9 line 3).
 *
 * @remarks
 * Available on the hook result as `form.Fields.TaxClassification` only when the
 * document carries classification checkboxes; `undefined` otherwise. Collapses
 * the seven W-9 classification checkboxes into one required selection. Selecting
 * `limited_liability_company` reveals `Fields.LlcClassificationCode`; selecting
 * `other` reveals `Fields.OtherText`.
 *
 * @param props - {@link ContractorSignatureRadioFieldProps}.
 * @returns The rendered radio group bound to `taxClassification`.
 * @public
 */
export function TaxClassificationField(props: ContractorSignatureRadioFieldProps) {
  return <RadioGroupHookField {...props} name="taxClassification" />
}

/**
 * Text input bound to the `homeAddressStreet1` field (W-9 line 5).
 *
 * @remarks
 * Available on the hook result as `form.Fields.HomeAddressStreet1` only when the
 * API returns `home_address_street_1`; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `homeAddressStreet1`.
 * @public
 */
export function HomeAddressStreet1Field(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="homeAddressStreet1" />
}

/**
 * Text input bound to the `homeAddressCity` field (W-9 line 6).
 *
 * @remarks
 * Available on the hook result as `form.Fields.HomeAddressCity` only when the
 * API returns `home_address_city`; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `homeAddressCity`.
 * @public
 */
export function HomeAddressCityField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="homeAddressCity" />
}

/**
 * Text input bound to the `homeAddressState` field (W-9 line 6).
 *
 * @remarks
 * Available on the hook result as `form.Fields.HomeAddressState` only when the
 * API returns `home_address_state`; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `homeAddressState`.
 * @public
 */
export function HomeAddressStateField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="homeAddressState" />
}

/**
 * Text input bound to the `homeAddressZip` field (W-9 line 6).
 *
 * @remarks
 * Available on the hook result as `form.Fields.HomeAddressZip` only when the
 * API returns `home_address_zip`; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `homeAddressZip`.
 * @public
 */
export function HomeAddressZipField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="homeAddressZip" />
}

/**
 * Text input bound to the `ssn` field (W-9 Part 1).
 *
 * @remarks
 * Available on the hook result as `form.Fields.Ssn` only when the API returns
 * `ssn`; `undefined` otherwise. Auto-formats numeric input as `XXX-XX-XXXX` while
 * still allowing the literal `N/A` sentinel to be typed (for a taxpayer who
 * supplies an EIN instead), and validates that the value is a real SSN or `N/A`.
 * When the API returns a masked SSN, the field renders empty with the mask as a
 * placeholder and is not required; leaving it untouched keeps the value on file.
 *
 * @param props - {@link ContractorSignatureSsnFieldProps}.
 * @returns The rendered text input bound to `ssn`.
 * @public
 */
export function SsnField(props: ContractorSignatureSsnFieldProps) {
  return <TextInputHookField {...props} name="ssn" transform={normalizeSsnOrNotApplicable} />
}

/**
 * Text input bound to the `ein` field (W-9 Part 1).
 *
 * @remarks
 * Available on the hook result as `form.Fields.Ein` only when the API returns
 * `ein`; `undefined` otherwise. Auto-formats numeric input as `NN-NNNNNNN` while
 * still allowing the literal `N/A` sentinel to be typed (for a taxpayer who
 * supplies an SSN instead), and validates that the value is a real EIN or `N/A`.
 * When the API returns a masked EIN, the field renders empty with the mask as a
 * placeholder and is not required; leaving it untouched keeps the value on file.
 *
 * @param props - {@link ContractorSignatureEinFieldProps}.
 * @returns The rendered text input bound to `ein`.
 * @public
 */
export function EinField(props: ContractorSignatureEinFieldProps) {
  return <TextInputHookField {...props} name="ein" transform={normalizeEinOrNotApplicable} />
}

/**
 * Text input bound to the `signatureText` field (W-9 Part 2).
 *
 * @remarks
 * Available on the hook result as `form.Fields.SignatureText` only when the API
 * returns `signature_text`; `undefined` otherwise. The contractor types their
 * full legal name; required.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `signatureText`.
 * @public
 */
export function SignatureTextField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="signatureText" />
}

/**
 * Checkbox bound to the `agree` field — electronic-signature consent.
 *
 * @remarks
 * Available on the hook result as `form.Fields.Agree`; always present. Must be
 * checked to submit.
 *
 * @param props - {@link ContractorSignatureAgreeFieldProps}.
 * @returns The rendered checkbox bound to `agree`.
 * @public
 */
export function AgreeField(props: ContractorSignatureAgreeFieldProps) {
  return <CheckboxHookField {...props} name="agree" />
}

// ── Variable fields (rendered only when the API returns them) ─────────

/**
 * Text input bound to the `businessName` field (W-9 line 2).
 *
 * @remarks
 * Available on the hook result as `form.Fields.BusinessName` only when the API
 * returns the `business_name` field; `undefined` otherwise — null-check before
 * rendering.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `businessName`.
 * @public
 */
export function BusinessNameField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="businessName" />
}

/**
 * Select bound to the synthesized `llcClassificationCode` field.
 *
 * @remarks
 * Available on the hook result as `form.Fields.LlcClassificationCode` only when
 * the document carries classification checkboxes; `undefined` otherwise. Render
 * it only while `taxClassification` is `limited_liability_company`.
 *
 * @param props - {@link ContractorSignatureSelectFieldProps}.
 * @returns The rendered select bound to `llcClassificationCode`.
 * @public
 */
export function LlcClassificationCodeField(props: ContractorSignatureSelectFieldProps) {
  return <SelectHookField {...props} name="llcClassificationCode" />
}

/**
 * Text input bound to the `otherText` field (free-text "Other" classification).
 *
 * @remarks
 * Available on the hook result as `form.Fields.OtherText` only when the API
 * returns the `other_text` field; `undefined` otherwise. Render it only while
 * `taxClassification` is `other`.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `otherText`.
 * @public
 */
export function OtherTextField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="otherText" />
}

/**
 * Checkbox bound to the `foreignPartners` field (W-9 line 3b).
 *
 * @remarks
 * Available on the hook result as `form.Fields.ForeignPartners` only when the
 * API returns the `foreign_partners` field; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureCheckboxFieldProps}.
 * @returns The rendered checkbox bound to `foreignPartners`.
 * @public
 */
export function ForeignPartnersField(props: ContractorSignatureCheckboxFieldProps) {
  return <CheckboxHookField {...props} name="foreignPartners" />
}

/**
 * Text input bound to the `exemptPayeeCode` field (W-9 line 4a).
 *
 * @remarks
 * Available on the hook result as `form.Fields.ExemptPayeeCode` only when the
 * API returns the `exempt_payee_code` field; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `exemptPayeeCode`.
 * @public
 */
export function ExemptPayeeCodeField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="exemptPayeeCode" />
}

/**
 * Text input bound to the `exemptionFromFatca` field (W-9 line 4b).
 *
 * @remarks
 * Available on the hook result as `form.Fields.ExemptionFromFatca` only when the
 * API returns the `exemption_from_FATCA` field; `undefined` otherwise. This is a
 * FATCA-exemption code (free text), not a checkbox.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `exemptionFromFatca`.
 * @public
 */
export function ExemptionFromFatcaField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="exemptionFromFatca" />
}

/**
 * Text input bound to the `homeAddressStreet2` field (W-9 line 5).
 *
 * @remarks
 * Available on the hook result as `form.Fields.HomeAddressStreet2` only when the
 * API returns the `home_address_street_2` field; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `homeAddressStreet2`.
 * @public
 */
export function HomeAddressStreet2Field(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="homeAddressStreet2" />
}

/**
 * Text input bound to the `accountNumber` field (W-9 line 7).
 *
 * @remarks
 * Available on the hook result as `form.Fields.AccountNumber` only when the API
 * returns the `account_number` field; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `accountNumber`.
 * @public
 */
export function AccountNumberField(props: ContractorSignatureTextFieldProps) {
  return <TextInputHookField {...props} name="accountNumber" />
}

/**
 * Text input bound to the `companyName` field (requester's name and address).
 *
 * @remarks
 * Available on the hook result as `form.Fields.CompanyName` only when the API
 * returns the `company_name` field; `undefined` otherwise.
 *
 * @param props - {@link ContractorSignatureTextFieldProps}.
 * @returns The rendered text input bound to `companyName`.
 * @public
 */
export function CompanyNameField(props: ContractorSignatureTextFieldProps) {
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
  Name: typeof NameField | undefined
  /** Federal tax classification radio group; defined only when the document carries classification checkboxes. */
  TaxClassification: typeof TaxClassificationField | undefined
  /** Street address line 1; defined only when the API returns `home_address_street_1`. */
  HomeAddressStreet1: typeof HomeAddressStreet1Field | undefined
  /** City; defined only when the API returns `home_address_city`. */
  HomeAddressCity: typeof HomeAddressCityField | undefined
  /** State; defined only when the API returns `home_address_state`. */
  HomeAddressState: typeof HomeAddressStateField | undefined
  /** ZIP code; defined only when the API returns `home_address_zip`. */
  HomeAddressZip: typeof HomeAddressZipField | undefined
  /** Social Security Number; defined only when the API returns `ssn`. */
  Ssn: typeof SsnField | undefined
  /** Employer Identification Number; defined only when the API returns `ein`. */
  Ein: typeof EinField | undefined
  /** Typed signature; defined only when the API returns `signature_text`. */
  SignatureText: typeof SignatureTextField | undefined
  /** Electronic-signature consent checkbox; always present (synthesized, not an API field). */
  Agree: typeof AgreeField
  /** Business name; defined only when the API returns `business_name`. */
  BusinessName: typeof BusinessNameField | undefined
  /** LLC tax classification code select; defined only when classification checkboxes are present. */
  LlcClassificationCode: typeof LlcClassificationCodeField | undefined
  /** "Other" free-text classification; defined only when the API returns `other_text`. */
  OtherText: typeof OtherTextField | undefined
  /** Foreign partners checkbox; defined only when the API returns `foreign_partners`. */
  ForeignPartners: typeof ForeignPartnersField | undefined
  /** Exempt payee code; defined only when the API returns `exempt_payee_code`. */
  ExemptPayeeCode: typeof ExemptPayeeCodeField | undefined
  /** FATCA exemption code; defined only when the API returns `exemption_from_FATCA`. */
  ExemptionFromFatca: typeof ExemptionFromFatcaField | undefined
  /** Street address line 2; defined only when the API returns `home_address_street_2`. */
  HomeAddressStreet2: typeof HomeAddressStreet2Field | undefined
  /** Account number(s); defined only when the API returns `account_number`. */
  AccountNumber: typeof AccountNumberField | undefined
  /** Requester's name and address; defined only when the API returns `company_name`. */
  CompanyName: typeof CompanyNameField | undefined
}
