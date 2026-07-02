import { z } from 'zod'
import { NOT_APPLICABLE_VALUE } from './w9Fields'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { SSN_REGEX, EIN_REGEX } from '@/helpers/validations'
import { normalizeEin } from '@/helpers/federalEin'

/**
 * Validation error codes produced by the contractor signature form schema.
 *
 * @remarks
 * Use these constants as the keys in a field's `validationMessages` prop to map
 * an error code to a user-facing message.
 *
 * @public
 */
export const ContractorSignatureFormErrorCodes = {
  /** A required field was left empty. */
  REQUIRED: 'REQUIRED',
  /** The electronic-signature consent checkbox was not checked. */
  AGREE_REQUIRED: 'AGREE_REQUIRED',
  /** The Social Security Number is not a valid SSN. */
  INVALID_SSN: 'INVALID_SSN',
  /** The Employer Identification Number is not a valid EIN. */
  INVALID_EIN: 'INVALID_EIN',
} as const

/**
 * Union of validation error code strings emitted by the contractor signature
 * form schema.
 *
 * @public
 */
export type ContractorSignatureFormErrorCode =
  (typeof ContractorSignatureFormErrorCodes)[keyof typeof ContractorSignatureFormErrorCodes]

const fieldValidators = {
  /** Entity or individual name (W-9 line 1). */
  name: z.string(),
  /** Business name, if different (W-9 line 2). */
  businessName: z.string(),
  /** Selected federal tax classification option key (W-9 line 3). */
  taxClassification: z.string(),
  /** LLC tax classification code, set only when the LLC classification is selected. */
  llcClassificationCode: z.string(),
  /** Free-text classification entry, used only when the "Other" classification is selected. */
  otherText: z.string(),
  /** Whether the payee has foreign partners/owners/beneficiaries (W-9 line 3b). */
  foreignPartners: z.boolean(),
  /** Exempt payee code (W-9 line 4a). */
  exemptPayeeCode: z.string(),
  /** Exemption from FATCA reporting code (W-9 line 4b). */
  exemptionFromFatca: z.string(),
  /** Street address line 1 (W-9 line 5). */
  homeAddressStreet1: z.string(),
  /** Street address line 2 (W-9 line 5). */
  homeAddressStreet2: z.string(),
  /** City (W-9 line 6). */
  homeAddressCity: z.string(),
  /** State (W-9 line 6). */
  homeAddressState: z.string(),
  /** ZIP code (W-9 line 6). */
  homeAddressZip: z.string(),
  /** Account number(s) (W-9 line 7). */
  accountNumber: z.string(),
  /** Requester's name and address. */
  companyName: z.string(),
  /**
   * Social Security Number. Accepts a 9-digit SSN (validated digits-only) or the
   * `N/A` sentinel the API uses when the W-9 collects an EIN instead. A redacted
   * value left untouched (empty) is valid — the server keeps the SSN on file.
   */
  ssn: z.string().refine(v => v === NOT_APPLICABLE_VALUE || SSN_REGEX.test(v.replace(/\D/g, '')), {
    message: ContractorSignatureFormErrorCodes.INVALID_SSN,
  }),
  /**
   * Employer Identification Number. Accepts a formatted EIN (`NN-NNNNNNN`) or the
   * `N/A` sentinel the API uses when the W-9 collects an SSN instead. A redacted
   * value left untouched (empty) is valid — the server keeps the EIN on file.
   */
  ein: z.string().refine(v => v === NOT_APPLICABLE_VALUE || EIN_REGEX.test(normalizeEin(v)), {
    message: ContractorSignatureFormErrorCodes.INVALID_EIN,
  }),
  /** Typed signature. */
  signatureText: z.string(),
  /** Electronic-signature consent; must be checked to submit. */
  agree: z.boolean(),
}

/**
 * Shape of the values managed by {@link useContractorSignatureForm}.
 *
 * @remarks
 * Keys are the camelCase react-hook-form field names. `taxClassification` and
 * `llcClassificationCode` are synthesized (they have no single API field), and
 * `agree` is the electronic-signature consent; all other keys map to a W-9 API
 * field via the hook's serializer.
 *
 * @public
 * @interface
 */
export type ContractorSignatureFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Validated submission shape produced by the {@link useContractorSignatureForm} schema.
 *
 * @public
 */
export type ContractorSignatureFormOutputs = ContractorSignatureFormData

const requiredFieldsConfig = {
  // Optional by default; partners can promote these via `optionalFieldsToRequire`.
  // These all back W-9 API fields the document marks `required: false`
  // (`llcClassificationCode` serializes into the optional `tax_classification`
  // field, `otherText` into the optional `other_text` field), so the form never
  // forces them — it mirrors the API's requiredness rather than adding its own.
  businessName: 'never',
  llcClassificationCode: 'never',
  otherText: 'never',
  exemptPayeeCode: 'never',
  exemptionFromFatca: 'never',
  foreignPartners: 'never',
  homeAddressStreet2: 'never',
  accountNumber: 'never',
  companyName: 'never',
  // name, taxClassification, homeAddressStreet1/City/State/Zip, ssn, ein,
  // signatureText, and agree are omitted → 'always' required. ssn/ein are
  // exempted at build time when their value arrived redacted (see factory).
} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Optional W-9 fields a partner can promote to required.
 *
 * @public
 */
export type ContractorSignatureOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/**
 * Options for {@link createContractorSignatureFormSchema}.
 *
 * @internal
 */
export interface ContractorSignatureSchemaOptions {
  /** Partner overrides promoting optional fields to required. */
  optionalFieldsToRequire?: ContractorSignatureOptionalFieldsToRequire
  /** Whether the SSN arrived redacted (a value is already on file, so an empty input is valid). */
  ssnRedacted?: boolean
  /** Whether the EIN arrived redacted (a value is already on file, so an empty input is valid). */
  einRedacted?: boolean
}

/**
 * Builds the W-9 signing form schema and its metadata config.
 *
 * @remarks
 * Required-field rules are declarative (`requiredFieldsConfig`) and the W-9 is
 * always a create operation. `ssn`/`ein` are exempted from required validation
 * when their value arrived redacted; `agree` must be checked (enforced via the
 * `superRefine`).
 *
 * @param options - Partner overrides and API-derived redaction flags.
 * @returns The `[schema, metadataConfig]` tuple from {@link buildFormSchema}.
 * @internal
 */
export function createContractorSignatureFormSchema({
  optionalFieldsToRequire,
  ssnRedacted = false,
  einRedacted = false,
}: ContractorSignatureSchemaOptions = {}) {
  const fieldsWithRedactedValues: Array<keyof typeof fieldValidators> = []
  if (ssnRedacted) fieldsWithRedactedValues.push('ssn')
  if (einRedacted) fieldsWithRedactedValues.push('ein')

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorSignatureFormErrorCodes.REQUIRED,
    mode: 'create',
    optionalFieldsToRequire,
    fieldsWithRedactedValues,
    superRefine: (data, ctx) => {
      if (!data.agree) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['agree'],
          message: ContractorSignatureFormErrorCodes.AGREE_REQUIRED,
        })
      }
    },
  })
}
