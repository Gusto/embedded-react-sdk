import { describe, expect, it } from 'vitest'
import type { Document } from '@gusto/embedded-api-v-2026-02-01/models/components/document'
import {
  buildW9Defaults,
  serializeW9Fields,
  getPresentFieldNames,
  getRedactionState,
  isW9Document,
  normalizeEinOrNotApplicable,
  normalizeSsnOrNotApplicable,
  TAX_CLASSIFICATION_FIELD,
  LLC_CLASSIFICATION_FIELD,
} from './w9Fields'
import type { ContractorSignatureFormData } from './contractorSignatureFormSchema'

function w9Document(overrides: Partial<Document> = {}): Document {
  return {
    uuid: 'doc-1',
    name: 'taxpayer_identification_form_w_9',
    title: 'W-9',
    requiresSigning: true,
    fields: [
      { key: 'name', value: 'Klay Thompson', dataType: 'full_name', required: true },
      { key: 'business_name', value: null, dataType: 'text', required: false },
      { key: 'individual_proprietor', value: null, dataType: 'checkbox', required: true },
      { key: 'c_corporation', value: null, dataType: 'checkbox', required: true },
      { key: 's_corporation', value: null, dataType: 'checkbox', required: true },
      { key: 'partnership', value: null, dataType: 'checkbox', required: true },
      { key: 'trust_estate', value: null, dataType: 'checkbox', required: true },
      { key: 'limited_liability_company', value: null, dataType: 'checkbox', required: true },
      { key: 'tax_classification', value: null, dataType: 'text', required: false },
      { key: 'exempt_payee_code', value: null, dataType: 'text', required: false },
      { key: 'exemption_from_FATCA', value: null, dataType: 'text', required: false },
      { key: 'other', value: null, dataType: 'checkbox', required: true },
      { key: 'other_text', value: null, dataType: 'text', required: false },
      { key: 'foreign_partners', value: null, dataType: 'checkbox', required: true },
      {
        key: 'home_address_street_1',
        value: '525 7th street',
        dataType: 'home_address_street_1',
        required: true,
      },
      {
        key: 'home_address_street_2',
        value: '',
        dataType: 'home_address_street_2',
        required: true,
      },
      {
        key: 'home_address_city',
        value: 'New York',
        dataType: 'home_address_city',
        required: true,
      },
      { key: 'home_address_state', value: 'NY', dataType: 'home_address_state', required: true },
      { key: 'home_address_zip', value: '10022', dataType: 'home_address_zip', required: true },
      {
        key: 'company_name',
        value: 'Entercross Systems',
        dataType: 'company_name',
        required: true,
      },
      { key: 'account_number', value: null, dataType: 'text', required: false },
      { key: 'ssn', value: 'XXX-XX-3123', dataType: 'ssn', required: true },
      { key: 'ein', value: 'N/A', dataType: 'ein', required: true },
      { key: 'signature_text', value: null, dataType: 'signature', required: true },
      { key: 'date', value: '9/17/2025', dataType: 'date', required: true },
    ],
    ...overrides,
  }
}

describe('normalizeEinOrNotApplicable', () => {
  it('lets the N/A sentinel be typed through, normalized to uppercase', () => {
    expect(normalizeEinOrNotApplicable('N/A')).toBe('N/A')
    expect(normalizeEinOrNotApplicable('n/a')).toBe('N/A')
    expect(normalizeEinOrNotApplicable('na')).toBe('N/A')
  })

  it('preserves in-progress prefixes while the user types toward N/A', () => {
    expect(normalizeEinOrNotApplicable('N')).toBe('N')
    expect(normalizeEinOrNotApplicable('N/')).toBe('N/')
  })

  it('formats numeric input as a standard EIN', () => {
    expect(normalizeEinOrNotApplicable('123456789')).toBe('12-3456789')
  })
})

describe('normalizeSsnOrNotApplicable', () => {
  it('lets the N/A sentinel be typed through, normalized to uppercase', () => {
    expect(normalizeSsnOrNotApplicable('N/A')).toBe('N/A')
    expect(normalizeSsnOrNotApplicable('n/a')).toBe('N/A')
    expect(normalizeSsnOrNotApplicable('na')).toBe('N/A')
  })

  it('preserves in-progress prefixes while the user types toward N/A', () => {
    expect(normalizeSsnOrNotApplicable('N')).toBe('N')
    expect(normalizeSsnOrNotApplicable('N/')).toBe('N/')
  })

  it('formats numeric input as a standard SSN', () => {
    expect(normalizeSsnOrNotApplicable('123456789')).toBe('123-45-6789')
  })
})

describe('isW9Document', () => {
  it('identifies the W-9 by name', () => {
    expect(isW9Document(w9Document())).toBe(true)
    expect(isW9Document(w9Document({ name: 'contractor_handbook' }))).toBe(false)
  })
})

describe('getPresentFieldNames', () => {
  it('reports the synthesized classification fields when checkbox keys exist', () => {
    const present = getPresentFieldNames(w9Document())
    expect(present.has(TAX_CLASSIFICATION_FIELD)).toBe(true)
    expect(present.has(LLC_CLASSIFICATION_FIELD)).toBe(true)
  })

  it('reports a pass-through field as present only when the API returns its key', () => {
    const present = getPresentFieldNames(w9Document())
    expect(present.has('businessName')).toBe(true)
    expect(present.has('companyName')).toBe(true)

    const withoutBusinessName = w9Document({
      fields: w9Document().fields?.filter(field => field.key !== 'business_name'),
    })
    expect(getPresentFieldNames(withoutBusinessName).has('businessName')).toBe(false)
  })

  it('omits the classification fields when the document has no classification checkboxes', () => {
    const acknowledgeOnly = w9Document({ fields: [] })
    const present = getPresentFieldNames(acknowledgeOnly)
    expect(present.has(TAX_CLASSIFICATION_FIELD)).toBe(false)
    expect(present.size).toBe(0)
  })
})

describe('getRedactionState', () => {
  it('flags a masked SSN as redacted and surfaces the mask as a placeholder', () => {
    expect(getRedactionState(w9Document())).toMatchObject({
      ssnRedacted: true,
      ssnPlaceholder: 'XXX-XX-3123',
    })
  })

  it('does not flag an unmasked sensitive value (EIN "N/A") as redacted', () => {
    expect(getRedactionState(w9Document())).toMatchObject({ einRedacted: false })
  })
})

describe('buildW9Defaults', () => {
  it('seeds editable inputs from the API values keyed by camelCase field name', () => {
    expect(buildW9Defaults(w9Document())).toMatchObject({
      name: 'Klay Thompson',
      homeAddressStreet1: '525 7th street',
      homeAddressCity: 'New York',
      ein: 'N/A',
      companyName: 'Entercross Systems',
      agree: false,
      taxClassification: '',
    })
  })

  it('seeds an empty input for a masked (redacted) SSN', () => {
    expect(buildW9Defaults(w9Document()).ssn).toBe('')
  })

  it('preselects the classification whose checkbox value is set', () => {
    const document = w9Document({
      fields: w9Document().fields?.map(field =>
        field.key === 's_corporation' ? { ...field, value: '1' } : field,
      ),
    })
    expect(buildW9Defaults(document).taxClassification).toBe('s_corporation')
  })

  it('seeds the LLC code from tax_classification when the LLC classification is selected', () => {
    const document = w9Document({
      fields: w9Document().fields?.map(field => {
        if (field.key === 'limited_liability_company') return { ...field, value: 'true' }
        if (field.key === 'tax_classification') return { ...field, value: 'p' }
        return field
      }),
    })
    const defaults = buildW9Defaults(document)
    expect(defaults.taxClassification).toBe('limited_liability_company')
    expect(defaults.llcClassificationCode).toBe('p')
  })

  it('does not seed the LLC code when a non-LLC classification is selected', () => {
    const document = w9Document({
      fields: w9Document().fields?.map(field => {
        if (field.key === 's_corporation') return { ...field, value: 'true' }
        // A stray tax_classification value must not leak into a non-LLC selection.
        if (field.key === 'tax_classification') return { ...field, value: 'p' }
        return field
      }),
    })
    expect(buildW9Defaults(document).llcClassificationCode).toBe('')
  })
})

describe('serializeW9Fields', () => {
  function baseValues(
    overrides: Partial<ContractorSignatureFormData> = {},
  ): ContractorSignatureFormData {
    return {
      ...buildW9Defaults(w9Document()),
      taxClassification: 'c_corporation',
      signatureText: 'Klay Thompson',
      agree: true,
      ...overrides,
    }
  }

  const redaction = getRedactionState(w9Document())

  it('maps the chosen classification to value "1"', () => {
    const fields = serializeW9Fields(w9Document(), baseValues(), redaction)
    expect(fields).toContainEqual({ key: 'c_corporation', value: '1' })
  })

  it('only sends the chosen classification, not the unchosen ones', () => {
    const fields = serializeW9Fields(w9Document(), baseValues(), redaction)
    const classificationKeys = fields.filter(f => f.value === '1').map(f => f.key)
    expect(classificationKeys).toEqual(['c_corporation'])
  })

  it('sends the LLC code under the tax_classification key when LLC is selected', () => {
    const fields = serializeW9Fields(
      w9Document(),
      baseValues({
        taxClassification: 'limited_liability_company',
        llcClassificationCode: 'p',
      }),
      redaction,
    )
    expect(fields).toContainEqual({ key: 'limited_liability_company', value: '1' })
    expect(fields).toContainEqual({ key: 'tax_classification', value: 'p' })
  })

  it('includes other_text only when the Other classification is selected', () => {
    const withOther = serializeW9Fields(
      w9Document(),
      baseValues({ taxClassification: 'other', otherText: 'Custom entity' }),
      redaction,
    )
    expect(withOther).toContainEqual({ key: 'other_text', value: 'Custom entity' })

    const withoutOther = serializeW9Fields(w9Document(), baseValues(), redaction)
    expect(withoutOther.find(f => f.key === 'other_text')).toBeUndefined()
  })

  it('serializes the foreign-partners checkbox to "1"/"0"', () => {
    const checked = serializeW9Fields(
      w9Document(),
      baseValues({ foreignPartners: true }),
      redaction,
    )
    expect(checked).toContainEqual({ key: 'foreign_partners', value: '1' })

    const unchecked = serializeW9Fields(
      w9Document(),
      baseValues({ foreignPartners: false }),
      redaction,
    )
    expect(unchecked).toContainEqual({ key: 'foreign_partners', value: '0' })
  })

  it('serializes exemption_from_FATCA as its text code, not a checkbox', () => {
    const fields = serializeW9Fields(
      w9Document(),
      baseValues({ exemptionFromFatca: 'A' }),
      redaction,
    )
    expect(fields).toContainEqual({ key: 'exemption_from_FATCA', value: 'A' })
  })

  it('omits the date field so the API auto-fills it', () => {
    const fields = serializeW9Fields(w9Document(), baseValues(), redaction)
    expect(fields.find(f => f.key === 'date')).toBeUndefined()
  })

  it('passes edited non-sensitive values through as editable inputs', () => {
    const fields = serializeW9Fields(w9Document(), baseValues({ name: 'Edited Name' }), redaction)
    expect(fields).toContainEqual({ key: 'name', value: 'Edited Name' })
    expect(fields).toContainEqual({ key: 'ein', value: 'N/A' })
  })

  it('omits an untouched redacted SSN so the mask is never sent back', () => {
    const fields = serializeW9Fields(w9Document(), baseValues({ ssn: '' }), redaction)
    expect(fields.find(f => f.key === 'ssn')).toBeUndefined()
  })

  it('sends a replacement SSN when the contractor enters one', () => {
    const fields = serializeW9Fields(w9Document(), baseValues({ ssn: '123-45-6789' }), redaction)
    expect(fields).toContainEqual({ key: 'ssn', value: '123-45-6789' })
  })
})
