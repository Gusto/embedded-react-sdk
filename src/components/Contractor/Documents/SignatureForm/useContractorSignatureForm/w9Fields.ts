import type {
  Document,
  Fields as DocumentField,
} from '@gusto/embedded-api-v-2025-11-15/models/components/document'

/**
 * The `name` of the W-9 document — the only contractor document type that
 * supports signing today.
 *
 * @public
 */
export const W9_DOCUMENT_NAME = 'taxpayer_identification_form_w_9'

/**
 * Form-field name for the synthesized federal tax classification radio group.
 *
 * @public
 */
export const TAX_CLASSIFICATION_FIELD = 'taxClassification'

/**
 * Form-field name for the synthesized LLC tax classification code select.
 *
 * @public
 */
export const LLC_CLASSIFICATION_FIELD = 'llcClassificationCode'

/**
 * Ordered classification option keys backing the {@link TAX_CLASSIFICATION_FIELD}
 * radio group. Each maps to a W-9 checkbox field on the underlying document.
 *
 * @public
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
 * @public
 */
export type TaxClassificationOptionKey = (typeof TAX_CLASSIFICATION_OPTION_KEYS)[number]

/**
 * The classification option that reveals the LLC tax classification select.
 *
 * @public
 */
export const LLC_CLASSIFICATION_OPTION: TaxClassificationOptionKey = 'limited_liability_company'

/**
 * The classification option that reveals the "Other" free-text field.
 *
 * @public
 */
export const OTHER_CLASSIFICATION_OPTION: TaxClassificationOptionKey = 'other'

/**
 * Ordered LLC tax classification code options.
 *
 * @public
 */
export const LLC_CLASSIFICATION_CODES = ['c', 's', 'p'] as const

/**
 * The W-9 `other_text` API field key, revealed when "Other" is selected.
 *
 * @public
 */
export const OTHER_TEXT_FIELD = 'other_text'

/**
 * The W-9 `date` API field key, populated automatically at submit time.
 *
 * @public
 */
export const SIGNED_DATE_FIELD = 'date'

/**
 * Section a W-9 field belongs to, used to group fields under headings when
 * rendering the signing form.
 *
 * @public
 */
export type W9Section = 'classification' | 'exemptions' | 'address' | 'tin' | 'certification'

/**
 * Visual input variant for a W-9 field.
 *
 * @public
 */
export type W9FieldVariant = 'text' | 'checkbox' | 'radio' | 'select'

/**
 * A render-ready descriptor for a single W-9 form field.
 *
 * @public
 */
export interface W9FieldDescriptor {
  /** react-hook-form field name (also the i18n label sub-key). */
  name: string
  /** Underlying API field key for pass-through fields; absent for synthesized fields. */
  apiKey?: string
  /** Input variant used to pick the bound field component. */
  variant: W9FieldVariant
  /** Section this field is grouped under. */
  section: W9Section
  /** Whether the field must have a value for the form to submit. */
  isRequired: boolean
  /** When set, the field only renders while the classification radio holds this option. */
  visibleWhenClassification?: TaxClassificationOptionKey
  /**
   * Whether the API returned a masked value for this field (e.g. a redacted
   * SSN/EIN). Redacted fields seed an empty input, surface the mask as a
   * placeholder, are exempt from required validation, and are omitted from the
   * sign payload unless the contractor types a replacement.
   */
  hasRedactedValue?: boolean
  /** The masked value to display as a placeholder for a redacted field. */
  placeholder?: string
}

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

/**
 * The W-9 layout plan, in render order. Pass-through entries carry the API
 * field key; synthesized entries (`taxClassification`, `llcClassificationCode`)
 * do not. The actual rendered set is filtered to fields present on the document.
 */
const W9_PLAN: Array<{
  name: string
  apiKey?: string
  variant: W9FieldVariant
  section: W9Section
  optional?: boolean
  visibleWhenClassification?: TaxClassificationOptionKey
}> = [
  { name: 'name', apiKey: 'name', variant: 'text', section: 'classification' },
  {
    name: 'business_name',
    apiKey: 'business_name',
    variant: 'text',
    section: 'classification',
    optional: true,
  },
  { name: TAX_CLASSIFICATION_FIELD, variant: 'radio', section: 'classification' },
  {
    name: LLC_CLASSIFICATION_FIELD,
    variant: 'select',
    section: 'classification',
    optional: true,
    visibleWhenClassification: LLC_CLASSIFICATION_OPTION,
  },
  {
    name: OTHER_TEXT_FIELD,
    apiKey: OTHER_TEXT_FIELD,
    variant: 'text',
    section: 'classification',
    optional: true,
    visibleWhenClassification: OTHER_CLASSIFICATION_OPTION,
  },
  {
    name: 'foreign_partners',
    apiKey: 'foreign_partners',
    variant: 'checkbox',
    section: 'classification',
    optional: true,
  },
  {
    name: 'exempt_payee_code',
    apiKey: 'exempt_payee_code',
    variant: 'text',
    section: 'exemptions',
    optional: true,
  },
  {
    name: 'exemption_from_FATCA',
    apiKey: 'exemption_from_FATCA',
    variant: 'checkbox',
    section: 'exemptions',
    optional: true,
  },
  {
    name: 'home_address_street_1',
    apiKey: 'home_address_street_1',
    variant: 'text',
    section: 'address',
  },
  {
    name: 'home_address_street_2',
    apiKey: 'home_address_street_2',
    variant: 'text',
    section: 'address',
    optional: true,
  },
  { name: 'home_address_city', apiKey: 'home_address_city', variant: 'text', section: 'address' },
  { name: 'home_address_state', apiKey: 'home_address_state', variant: 'text', section: 'address' },
  { name: 'home_address_zip', apiKey: 'home_address_zip', variant: 'text', section: 'address' },
  {
    name: 'account_number',
    apiKey: 'account_number',
    variant: 'text',
    section: 'address',
    optional: true,
  },
  {
    name: 'company_name',
    apiKey: 'company_name',
    variant: 'text',
    section: 'address',
    optional: true,
  },
  { name: 'ssn', apiKey: 'ssn', variant: 'text', section: 'tin' },
  { name: 'ein', apiKey: 'ein', variant: 'text', section: 'tin' },
  { name: 'signature_text', apiKey: 'signature_text', variant: 'text', section: 'certification' },
]

function indexFields(document: Document): Map<string, DocumentField> {
  const byKey = new Map<string, DocumentField>()
  for (const field of document.fields ?? []) {
    if (field.key) byKey.set(field.key, field)
  }
  return byKey
}

/**
 * Whether the document is a W-9 with signable fields.
 *
 * @public
 */
export function isW9Document(document: Document): boolean {
  return document.name === W9_DOCUMENT_NAME
}

/**
 * Builds the ordered, render-ready W-9 field descriptors for a document.
 *
 * @remarks
 * Pass-through fields are included only when present on the document; their
 * `isRequired` flag is driven by the API `required` flag unless the W-9 layout
 * marks them optional. The classification radio is included when any of the
 * classification checkbox fields are present.
 *
 * @param document - The W-9 document returned by the API.
 * @returns The ordered list of field descriptors to render.
 * @public
 */
export function buildW9FieldDescriptors(document: Document): W9FieldDescriptor[] {
  const byKey = indexFields(document)
  const hasClassification = TAX_CLASSIFICATION_OPTION_KEYS.some(key => byKey.has(key))

  const descriptors: W9FieldDescriptor[] = []
  for (const entry of W9_PLAN) {
    if (entry.apiKey) {
      const field = byKey.get(entry.apiKey)
      if (!field) continue
      const redacted = hasRedactedValue(field)
      descriptors.push({
        name: entry.name,
        apiKey: entry.apiKey,
        variant: entry.variant,
        section: entry.section,
        isRequired: entry.optional ? false : Boolean(field.required),
        visibleWhenClassification: entry.visibleWhenClassification,
        hasRedactedValue: redacted,
        placeholder: redacted ? (field.value ?? undefined) : undefined,
      })
      continue
    }

    if (entry.name === TAX_CLASSIFICATION_FIELD) {
      if (!hasClassification) continue
      descriptors.push({
        name: entry.name,
        variant: entry.variant,
        section: entry.section,
        isRequired: true,
      })
      continue
    }

    if (entry.name === LLC_CLASSIFICATION_FIELD) {
      if (!hasClassification) continue
      descriptors.push({
        name: entry.name,
        variant: entry.variant,
        section: entry.section,
        isRequired: false,
        visibleWhenClassification: LLC_CLASSIFICATION_OPTION,
      })
    }
  }

  return descriptors
}

/** Coerces an API checkbox value (`'1'`, `'true'`) to a boolean. */
function toBoolean(value: string | null | undefined): boolean {
  return value === '1' || value === 'true'
}

/**
 * The shape of values managed by the W-9 signing form.
 *
 * @public
 */
export type ContractorSignatureFormData = Record<string, string | boolean> & {
  /** Electronic-signature consent; must be checked to submit. */
  agree: boolean
}

/**
 * Builds default form values from a document's fields.
 *
 * @remarks
 * Pass-through values are seeded from the API `value`. The classification radio
 * defaults to whichever classification checkbox is already set (`'1'`).
 *
 * @param document - The W-9 document returned by the API.
 * @param descriptors - The descriptors produced by {@link buildW9FieldDescriptors}.
 * @returns The default form values.
 * @public
 */
export function buildW9Defaults(
  document: Document,
  descriptors: W9FieldDescriptor[],
): ContractorSignatureFormData {
  const byKey = indexFields(document)
  const defaults: ContractorSignatureFormData = { agree: false }

  for (const descriptor of descriptors) {
    if (descriptor.name === TAX_CLASSIFICATION_FIELD) {
      const selected = TAX_CLASSIFICATION_OPTION_KEYS.find(key => toBoolean(byKey.get(key)?.value))
      defaults[descriptor.name] = selected ?? ''
      continue
    }
    if (descriptor.name === LLC_CLASSIFICATION_FIELD) {
      defaults[descriptor.name] = ''
      continue
    }
    // A masked value must not seed the input — it would be echoed back as the
    // new value on submit. The mask surfaces as a placeholder instead.
    if (descriptor.hasRedactedValue) {
      defaults[descriptor.name] = ''
      continue
    }
    const field = descriptor.apiKey ? byKey.get(descriptor.apiKey) : undefined
    if (descriptor.variant === 'checkbox') {
      defaults[descriptor.name] = toBoolean(field?.value)
    } else {
      defaults[descriptor.name] = field?.value ?? ''
    }
  }

  return defaults
}

/**
 * A single `{ key, value }` pair sent in the sign request.
 *
 * @public
 */
export interface SignFieldValue {
  /** The API field key. */
  key: string
  /** The serialized field value. */
  value: string
}

/**
 * Serializes W-9 form values into the `{ key, value }` field array expected by
 * the sign API.
 *
 * @remarks
 * Applies the W-9 mapping: the chosen classification key is sent with value
 * `'1'`; when the LLC classification is chosen, the selected LLC code is sent
 * under the `tax_classification` key. Checkboxes serialize to `'1'`/`'0'`. The
 * `other_text` and `llcClassificationCode` values are only included for their
 * respective classifications. The `date` field, when present on the document,
 * is set to today's date.
 *
 * @param document - The W-9 document being signed.
 * @param descriptors - The descriptors produced by {@link buildW9FieldDescriptors}.
 * @param values - The validated form values.
 * @returns The ordered field array for the sign request body.
 * @public
 */
export function serializeW9Fields(
  document: Document,
  descriptors: W9FieldDescriptor[],
  values: ContractorSignatureFormData,
): SignFieldValue[] {
  const byKey = indexFields(document)
  const fields: SignFieldValue[] = []

  const classification = String(values[TAX_CLASSIFICATION_FIELD] ?? '')

  for (const descriptor of descriptors) {
    if (
      descriptor.name === TAX_CLASSIFICATION_FIELD ||
      descriptor.name === LLC_CLASSIFICATION_FIELD
    ) {
      continue
    }
    if (!descriptor.apiKey) continue

    // Conditionally-revealed fields are only submitted when their controlling
    // classification is active — matching the rendered form.
    if (
      descriptor.visibleWhenClassification &&
      descriptor.visibleWhenClassification !== classification
    ) {
      continue
    }

    const value = values[descriptor.name]

    // A redacted field left untouched is omitted so the masked value isn't sent
    // back as a replacement; the server keeps the value already on file.
    if (descriptor.hasRedactedValue && (value === undefined || value === null || value === '')) {
      continue
    }

    if (descriptor.variant === 'checkbox') {
      fields.push({ key: descriptor.apiKey, value: value ? '1' : '0' })
    } else {
      fields.push({ key: descriptor.apiKey, value: String(value ?? '') })
    }
  }

  if (classification) {
    fields.push({ key: classification, value: '1' })
    if (classification === LLC_CLASSIFICATION_OPTION) {
      fields.push({
        key: 'tax_classification',
        value: String(values[LLC_CLASSIFICATION_FIELD] ?? ''),
      })
    }
  }

  if (byKey.has(SIGNED_DATE_FIELD)) {
    fields.push({ key: SIGNED_DATE_FIELD, value: new Date().toISOString().slice(0, 10) })
  }

  return fields
}
