import type {
  Document,
  Fields as DocumentField,
} from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import type { ContractorSignatureFormData } from './contractorSignatureFormSchema'
import { normalizeEin } from '@/helpers/federalEin'
import { normalizeSSN } from '@/helpers/ssn'

/**
 * The `name` of the W-9 document — the only contractor document type that
 * supports signing today.
 *
 * @internal
 */
export const W9_DOCUMENT_NAME = 'taxpayer_identification_form_w_9'

/**
 * Sentinel the API returns (and accepts) for a taxpayer-ID field that doesn't
 * apply to the signer — e.g. the EIN of an individual contractor, or the SSN of
 * a business contractor. The sign endpoint stamps this verbatim, so the form
 * both prefills it and treats it as a valid submission.
 *
 * @internal
 */
export const NOT_APPLICABLE_VALUE = 'N/A'

/**
 * EIN input transform that preserves the `N/A` sentinel (and the in-progress
 * prefixes a user types toward it) while formatting numeric input as a standard
 * EIN (`NN-NNNNNNN`).
 *
 * @remarks
 * The W-9 accepts `N/A` for a taxpayer who supplies an SSN instead of an EIN,
 * but the plain `normalizeEin` formatter strips every non-digit on each
 * keystroke — making the sentinel impossible to type. This wrapper lets the
 * sentinel through (normalized to uppercase) and defers to `normalizeEin` for
 * everything else.
 *
 * @param value - Raw user input.
 * @returns The `N/A` sentinel (or an in-progress prefix), otherwise the EIN-formatted value.
 * @internal
 */
export function normalizeEinOrNotApplicable(value: string): string {
  const sentinel = value.replace(/\s/g, '').toUpperCase()
  if (sentinel === 'NA') return NOT_APPLICABLE_VALUE
  if (sentinel === 'N' || sentinel === 'N/' || sentinel === NOT_APPLICABLE_VALUE) return sentinel
  return normalizeEin(value)
}

/**
 * SSN input transform that preserves the `N/A` sentinel (and the in-progress
 * prefixes `N` and `N/`) while otherwise deferring to {@link normalizeSSN}.
 *
 * @remarks
 * The W-9 accepts `N/A` for a taxpayer who supplies an EIN instead of an SSN,
 * but the plain `normalizeSSN` formatter strips every non-digit on each
 * keystroke — making the sentinel impossible to type. This wrapper lets the
 * sentinel through (normalized to uppercase) and defers to `normalizeSSN` for
 * everything else.
 *
 * @param value - Raw user input.
 * @returns The `N/A` sentinel (or an in-progress prefix), otherwise the SSN-formatted value.
 * @internal
 */
export function normalizeSsnOrNotApplicable(value: string): string {
  const sentinel = value.replace(/\s/g, '').toUpperCase()
  if (sentinel === 'NA') return NOT_APPLICABLE_VALUE
  if (sentinel === 'N' || sentinel === 'N/' || sentinel === NOT_APPLICABLE_VALUE) return sentinel
  return normalizeSSN(value)
}

/**
 * Form-field name for the synthesized federal tax classification radio group.
 *
 * @internal
 */
export const TAX_CLASSIFICATION_FIELD = 'taxClassification'

/**
 * Form-field name for the synthesized LLC tax classification code select.
 *
 * @internal
 */
export const LLC_CLASSIFICATION_FIELD = 'llcClassificationCode'

/**
 * Form-field name for the "Other" free-text classification field.
 *
 * @internal
 */
export const OTHER_TEXT_FIELD = 'otherText'

/**
 * Ordered classification option keys backing the {@link TAX_CLASSIFICATION_FIELD}
 * radio group. Each maps to a W-9 checkbox field on the underlying document.
 *
 * @internal
 */
export const TAX_CLASSIFICATION_OPTION_KEYS = [
  'individual_proprietor',
  'c_corporation',
  's_corporation',
  'partnership',
  'trust_estate',
  'limited_liability_company',
  'other',
] as const

/**
 * A single federal tax classification option key.
 *
 * @internal
 */
export type TaxClassificationOptionKey = (typeof TAX_CLASSIFICATION_OPTION_KEYS)[number]

/**
 * The classification option that reveals the LLC tax classification select.
 *
 * @internal
 */
export const LLC_CLASSIFICATION_OPTION: TaxClassificationOptionKey = 'limited_liability_company'

/**
 * The classification option that reveals the "Other" free-text field.
 *
 * @internal
 */
export const OTHER_CLASSIFICATION_OPTION: TaxClassificationOptionKey = 'other'

/**
 * Ordered LLC tax classification code options.
 *
 * @internal
 */
export const LLC_CLASSIFICATION_CODES = ['c', 's', 'p'] as const

/**
 * Maps each pass-through {@link ContractorSignatureFormData} field to its W-9
 * API field key. Synthesized fields (`taxClassification`,
 * `llcClassificationCode`) and `agree` are intentionally absent.
 *
 * @internal
 */
export const W9_FIELD_API_KEYS = {
  name: 'name',
  businessName: 'business_name',
  otherText: 'other_text',
  foreignPartners: 'foreign_partners',
  exemptPayeeCode: 'exempt_payee_code',
  exemptionFromFatca: 'exemption_from_FATCA',
  homeAddressStreet1: 'home_address_street_1',
  homeAddressStreet2: 'home_address_street_2',
  homeAddressCity: 'home_address_city',
  homeAddressState: 'home_address_state',
  homeAddressZip: 'home_address_zip',
  accountNumber: 'account_number',
  companyName: 'company_name',
  ssn: 'ssn',
  ein: 'ein',
  signatureText: 'signature_text',
} as const satisfies Record<string, string>

/** A pass-through W-9 field name (one with a single backing API key). */
type PassThroughFieldName = keyof typeof W9_FIELD_API_KEYS

/** API field keys whose values are sensitive and arrive masked when on file. */
const SENSITIVE_FIELD_KEYS = new Set(['ssn', 'ein'])

/** Whether a value is a server-side mask (e.g. `XXX-XX-1111`) rather than real input. */
function isMaskedValue(value: string | null | undefined): boolean {
  return typeof value === 'string' && /[X•*]/.test(value)
}

/** Whether a document field carries a redacted (masked) sensitive value. */
function hasRedactedValue(field: DocumentField | undefined): boolean {
  if (!field) return false
  const isSensitive =
    SENSITIVE_FIELD_KEYS.has(field.key ?? '') ||
    field.dataType === 'ssn' ||
    field.dataType === 'ein'
  return isSensitive && isMaskedValue(field.value)
}

function indexFields(document: Document): Map<string, DocumentField> {
  const byKey = new Map<string, DocumentField>()
  for (const field of document.fields ?? []) {
    if (field.key) byKey.set(field.key, field)
  }
  return byKey
}

/** Coerces an API checkbox value (`'1'`, `'true'`) to a boolean. */
function toBoolean(value: string | null | undefined): boolean {
  return value === '1' || value === 'true'
}

/**
 * Whether the document is a W-9 (the only signable contractor document type).
 *
 * @internal
 */
export function isW9Document(document: Document): boolean {
  return document.name === W9_DOCUMENT_NAME
}

/**
 * Redaction state for the sensitive W-9 fields, derived from the API response.
 *
 * @internal
 */
export interface W9RedactionState {
  /** Whether the API returned a masked SSN value. */
  ssnRedacted: boolean
  /** Whether the API returned a masked EIN value. */
  einRedacted: boolean
  /** The masked SSN to surface as a placeholder, when redacted. */
  ssnPlaceholder?: string
  /** The masked EIN to surface as a placeholder, when redacted. */
  einPlaceholder?: string
}

/**
 * Computes the redaction state of the SSN/EIN fields from the document.
 *
 * @param document - The W-9 document returned by the API.
 * @returns The redaction flags and masked placeholders.
 * @internal
 */
export function getRedactionState(document: Document): W9RedactionState {
  const byKey = indexFields(document)
  const ssnField = byKey.get('ssn')
  const einField = byKey.get('ein')
  const ssnRedacted = hasRedactedValue(ssnField)
  const einRedacted = hasRedactedValue(einField)
  return {
    ssnRedacted,
    einRedacted,
    ssnPlaceholder: ssnRedacted ? (ssnField?.value ?? undefined) : undefined,
    einPlaceholder: einRedacted ? (einField?.value ?? undefined) : undefined,
  }
}

/**
 * Computes which W-9 form fields the API actually returned — the safety check
 * that drives presence-gating in {@link useContractorSignatureForm}.
 *
 * @remarks
 * A pass-through field is present when its API key is in `document.fields`. The
 * synthesized classification fields (`taxClassification`,
 * `llcClassificationCode`) are present when the document carries any of the
 * federal tax classification checkbox fields.
 *
 * @param document - The W-9 document returned by the API.
 * @returns The set of present camelCase field names.
 * @internal
 */
export function getPresentFieldNames(document: Document): Set<string> {
  const byKey = indexFields(document)
  const presentFieldNames = new Set<string>()

  for (const [fieldName, apiKey] of Object.entries(W9_FIELD_API_KEYS)) {
    if (byKey.has(apiKey)) presentFieldNames.add(fieldName)
  }

  const hasClassification = TAX_CLASSIFICATION_OPTION_KEYS.some(key => byKey.has(key))
  if (hasClassification) {
    presentFieldNames.add(TAX_CLASSIFICATION_FIELD)
    presentFieldNames.add(LLC_CLASSIFICATION_FIELD)
  }

  return presentFieldNames
}

/**
 * Builds default form values from a document's fields.
 *
 * @remarks
 * Pass-through values are seeded from the API `value`. The classification radio
 * defaults to whichever classification checkbox is already set (`'1'`/`'true'`),
 * and when that is the LLC classification the LLC code select is seeded from the
 * `tax_classification` field it serializes into. A masked SSN/EIN seeds an empty
 * input (the mask is surfaced as a placeholder instead) so it is never echoed
 * back as the new value on submit.
 *
 * @param document - The W-9 document returned by the API.
 * @returns The default form values.
 * @internal
 */
export function buildW9Defaults(document: Document): ContractorSignatureFormData {
  const byKey = indexFields(document)
  const redaction = getRedactionState(document)
  const textValue = (apiKey: string): string => byKey.get(apiKey)?.value ?? ''
  const selectedClassification =
    TAX_CLASSIFICATION_OPTION_KEYS.find(key => toBoolean(byKey.get(key)?.value)) ?? ''

  return {
    name: textValue('name'),
    businessName: textValue('business_name'),
    taxClassification: selectedClassification,
    // The LLC code serializes into the `tax_classification` field, so seed it
    // back from there when the LLC classification is the selected one.
    llcClassificationCode:
      selectedClassification === LLC_CLASSIFICATION_OPTION ? textValue('tax_classification') : '',
    otherText: textValue('other_text'),
    foreignPartners: toBoolean(byKey.get('foreign_partners')?.value),
    exemptPayeeCode: textValue('exempt_payee_code'),
    exemptionFromFatca: textValue('exemption_from_FATCA'),
    homeAddressStreet1: textValue('home_address_street_1'),
    homeAddressStreet2: textValue('home_address_street_2'),
    homeAddressCity: textValue('home_address_city'),
    homeAddressState: textValue('home_address_state'),
    homeAddressZip: textValue('home_address_zip'),
    accountNumber: textValue('account_number'),
    companyName: textValue('company_name'),
    ssn: redaction.ssnRedacted ? '' : textValue('ssn'),
    ein: redaction.einRedacted ? '' : textValue('ein'),
    signatureText: textValue('signature_text'),
    agree: false,
  }
}

/**
 * The empty default form values, used while the document is still loading.
 *
 * @internal
 */
export const EMPTY_W9_DEFAULTS: ContractorSignatureFormData = {
  name: '',
  businessName: '',
  taxClassification: '',
  llcClassificationCode: '',
  otherText: '',
  foreignPartners: false,
  exemptPayeeCode: '',
  exemptionFromFatca: '',
  homeAddressStreet1: '',
  homeAddressStreet2: '',
  homeAddressCity: '',
  homeAddressState: '',
  homeAddressZip: '',
  accountNumber: '',
  companyName: '',
  ssn: '',
  ein: '',
  signatureText: '',
  agree: false,
}

/**
 * A single `{ key, value }` pair sent in the sign request.
 *
 * @internal
 */
export interface SignFieldValue {
  /** The API field key. */
  key: string
  /** The serialized field value. */
  value: string
}

/** Pass-through text fields serialized verbatim (everything except the checkbox and TIN fields). */
const TEXT_PASS_THROUGH_FIELDS: PassThroughFieldName[] = [
  'name',
  'businessName',
  'exemptPayeeCode',
  'exemptionFromFatca',
  'homeAddressStreet1',
  'homeAddressStreet2',
  'homeAddressCity',
  'homeAddressState',
  'homeAddressZip',
  'accountNumber',
  'companyName',
  'signatureText',
]

/**
 * Serializes W-9 form values into the `{ key, value }` field array expected by
 * the sign API.
 *
 * @remarks
 * Only fields the API returned (see {@link getPresentFieldNames}) are sent.
 * Applies the W-9 mapping: the chosen classification key is sent with value
 * `'1'`; when the LLC classification is chosen, the selected LLC code is sent
 * under the `tax_classification` key. `foreignPartners` serializes to
 * `'1'`/`'0'`. The `otherText` value is only included for the "Other"
 * classification. An untouched redacted SSN/EIN is omitted so the mask is never
 * sent back. The `date` field is intentionally omitted so the API auto-fills the
 * signing date in its own locale-correct format.
 *
 * @param document - The W-9 document being signed.
 * @param values - The validated form values.
 * @param redaction - The redaction state from {@link getRedactionState}.
 * @returns The ordered field array for the sign request body.
 * @internal
 */
export function serializeW9Fields(
  document: Document,
  values: ContractorSignatureFormData,
  redaction: W9RedactionState,
): SignFieldValue[] {
  const presentFieldNames = getPresentFieldNames(document)
  const fields: SignFieldValue[] = []
  // The schema preprocesses empty inputs to `undefined`, so read through an
  // `unknown` view and coalesce missing values to an empty string.
  const raw = values as Record<string, unknown>
  const text = (name: string): string => {
    const value = raw[name]
    return typeof value === 'string' ? value : ''
  }
  const classification = text('taxClassification')

  const pushField = (fieldName: PassThroughFieldName, value: string) => {
    fields.push({ key: W9_FIELD_API_KEYS[fieldName], value })
  }

  for (const fieldName of TEXT_PASS_THROUGH_FIELDS) {
    if (!presentFieldNames.has(fieldName)) continue
    pushField(fieldName, text(fieldName))
  }

  if (presentFieldNames.has(OTHER_TEXT_FIELD) && classification === OTHER_CLASSIFICATION_OPTION) {
    pushField('otherText', text('otherText'))
  }

  if (presentFieldNames.has('foreignPartners')) {
    fields.push({
      key: W9_FIELD_API_KEYS.foreignPartners,
      value: values.foreignPartners ? '1' : '0',
    })
  }

  // A redacted field left untouched is omitted so the masked value isn't sent
  // back as a replacement; the server keeps the value already on file.
  const ssnValue = text('ssn')
  const einValue = text('ein')
  if (presentFieldNames.has('ssn') && !(redaction.ssnRedacted && ssnValue === '')) {
    pushField('ssn', ssnValue)
  }
  if (presentFieldNames.has('ein') && !(redaction.einRedacted && einValue === '')) {
    pushField('ein', einValue)
  }

  if (classification) {
    fields.push({ key: classification, value: '1' })
    if (classification === LLC_CLASSIFICATION_OPTION) {
      fields.push({ key: 'tax_classification', value: text('llcClassificationCode') })
    }
  }

  return fields
}
