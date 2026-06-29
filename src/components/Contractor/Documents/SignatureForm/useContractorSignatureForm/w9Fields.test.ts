import { describe, expect, it } from 'vitest'
import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import {
  buildW9Defaults,
  buildW9FieldDescriptors,
  serializeW9Fields,
  TAX_CLASSIFICATION_FIELD,
  LLC_CLASSIFICATION_FIELD,
  isW9Document,
  type ContractorSignatureFormData,
} from './w9Fields'

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

describe('isW9Document', () => {
  it('identifies the W-9 by name', () => {
    expect(isW9Document(w9Document())).toBe(true)
    expect(isW9Document(w9Document({ name: 'contractor_handbook' }))).toBe(false)
  })
})

describe('buildW9FieldDescriptors', () => {
  it('synthesizes a single required classification radio from the checkbox keys', () => {
    const descriptors = buildW9FieldDescriptors(w9Document())
    const classification = descriptors.find(d => d.name === TAX_CLASSIFICATION_FIELD)
    expect(classification).toMatchObject({
      name: TAX_CLASSIFICATION_FIELD,
      variant: 'radio',
      section: 'classification',
      isRequired: true,
    })
  })

  it('does not render the seven classification checkboxes as standalone fields', () => {
    const names = buildW9FieldDescriptors(w9Document()).map(d => d.name)
    expect(names).not.toContain('individual_proprietor')
    expect(names).not.toContain('c_corporation')
    expect(names).not.toContain('limited_liability_company')
  })

  it('marks gws-flows-optional fields optional regardless of the API required flag', () => {
    const descriptors = buildW9FieldDescriptors(w9Document())
    const byName = Object.fromEntries(descriptors.map(d => [d.name, d]))
    expect(byName.business_name).toMatchObject({ isRequired: false })
    expect(byName.account_number).toMatchObject({ isRequired: false })
    expect(byName.company_name).toMatchObject({ isRequired: false })
    expect(byName.home_address_street_2).toMatchObject({ isRequired: false })
  })

  it('derives the input variant from the API data_type', () => {
    const byName = Object.fromEntries(buildW9FieldDescriptors(w9Document()).map(d => [d.name, d]))
    // exemption_from_FATCA is a FATCA-exemption code (text), not a checkbox.
    expect(byName.exemption_from_FATCA).toMatchObject({ variant: 'text' })
    expect(byName.foreign_partners).toMatchObject({ variant: 'checkbox' })
    expect(byName.ssn).toMatchObject({ variant: 'text' })
  })

  it('keeps API-required fields required', () => {
    const byName = Object.fromEntries(buildW9FieldDescriptors(w9Document()).map(d => [d.name, d]))
    expect(byName.name).toMatchObject({ isRequired: true })
    expect(byName.ssn).toMatchObject({ isRequired: true })
    expect(byName.signature_text).toMatchObject({ isRequired: true })
  })

  it('groups fields into ordered sections', () => {
    const sections = buildW9FieldDescriptors(w9Document()).map(d => d.section)
    expect(sections).toContain('classification')
    expect(sections).toContain('exemptions')
    expect(sections).toContain('address')
    expect(sections).toContain('tin')
    expect(sections).toContain('certification')
  })
})

describe('buildW9Defaults', () => {
  it('seeds editable inputs from the API values', () => {
    const descriptors = buildW9FieldDescriptors(w9Document())
    const defaults = buildW9Defaults(w9Document(), descriptors)
    expect(defaults).toMatchObject({
      name: 'Klay Thompson',
      home_address_street_1: '525 7th street',
      home_address_city: 'New York',
      ein: 'N/A',
      company_name: 'Entercross Systems',
      agree: false,
      [TAX_CLASSIFICATION_FIELD]: '',
    })
  })

  it('seeds an empty input for a masked (redacted) SSN', () => {
    const descriptors = buildW9FieldDescriptors(w9Document())
    const defaults = buildW9Defaults(w9Document(), descriptors)
    expect(defaults.ssn).toBe('')
  })

  it('preselects the classification whose checkbox value is set', () => {
    const document = w9Document({
      fields: w9Document().fields?.map(field =>
        field.key === 's_corporation' ? { ...field, value: '1' } : field,
      ),
    })
    const descriptors = buildW9FieldDescriptors(document)
    const defaults = buildW9Defaults(document, descriptors)
    expect(defaults[TAX_CLASSIFICATION_FIELD]).toBe('s_corporation')
  })
})

describe('serializeW9Fields', () => {
  const descriptors = buildW9FieldDescriptors(w9Document())

  function baseValues(
    overrides: Partial<ContractorSignatureFormData> = {},
  ): ContractorSignatureFormData {
    return {
      ...buildW9Defaults(w9Document(), descriptors),
      [TAX_CLASSIFICATION_FIELD]: 'c_corporation',
      signature_text: 'Klay Thompson',
      agree: true,
      ...overrides,
    }
  }

  it('maps the chosen classification to value "1"', () => {
    const fields = serializeW9Fields(w9Document(), descriptors, baseValues())
    expect(fields).toContainEqual({ key: 'c_corporation', value: '1' })
  })

  it('only sends the chosen classification, not the unchosen ones', () => {
    const fields = serializeW9Fields(w9Document(), descriptors, baseValues())
    const classificationKeys = fields.filter(f => f.value === '1').map(f => f.key)
    expect(classificationKeys).toEqual(['c_corporation'])
  })

  it('sends the LLC code under the tax_classification key when LLC is selected', () => {
    const fields = serializeW9Fields(
      w9Document(),
      descriptors,
      baseValues({
        [TAX_CLASSIFICATION_FIELD]: 'limited_liability_company',
        [LLC_CLASSIFICATION_FIELD]: 'p',
      }),
    )
    expect(fields).toContainEqual({ key: 'limited_liability_company', value: '1' })
    expect(fields).toContainEqual({ key: 'tax_classification', value: 'p' })
  })

  it('includes other_text only when the Other classification is selected', () => {
    const withOther = serializeW9Fields(
      w9Document(),
      descriptors,
      baseValues({ [TAX_CLASSIFICATION_FIELD]: 'other', other_text: 'Custom entity' }),
    )
    expect(withOther).toContainEqual({ key: 'other_text', value: 'Custom entity' })

    const withoutOther = serializeW9Fields(w9Document(), descriptors, baseValues())
    expect(withoutOther.find(f => f.key === 'other_text')).toBeUndefined()
  })

  it('serializes checkboxes to "1"/"0"', () => {
    const checked = serializeW9Fields(
      w9Document(),
      descriptors,
      baseValues({ foreign_partners: true }),
    )
    expect(checked).toContainEqual({ key: 'foreign_partners', value: '1' })

    const unchecked = serializeW9Fields(
      w9Document(),
      descriptors,
      baseValues({ foreign_partners: false }),
    )
    expect(unchecked).toContainEqual({ key: 'foreign_partners', value: '0' })
  })

  it('serializes exemption_from_FATCA as its text code, not a checkbox', () => {
    const fields = serializeW9Fields(
      w9Document(),
      descriptors,
      baseValues({ exemption_from_FATCA: 'A' }),
    )
    expect(fields).toContainEqual({ key: 'exemption_from_FATCA', value: 'A' })
  })

  it('omits the date field so the API auto-fills it', () => {
    const fields = serializeW9Fields(w9Document(), descriptors, baseValues())
    expect(fields.find(f => f.key === 'date')).toBeUndefined()
  })

  it('passes edited non-sensitive values through as editable inputs', () => {
    const fields = serializeW9Fields(w9Document(), descriptors, baseValues({ name: 'Edited Name' }))
    expect(fields).toContainEqual({ key: 'name', value: 'Edited Name' })
    expect(fields).toContainEqual({ key: 'ein', value: 'N/A' })
  })

  it('omits an untouched redacted SSN so the mask is never sent back', () => {
    const fields = serializeW9Fields(w9Document(), descriptors, baseValues({ ssn: '' }))
    expect(fields.find(f => f.key === 'ssn')).toBeUndefined()
  })

  it('sends a replacement SSN when the contractor enters one', () => {
    const fields = serializeW9Fields(w9Document(), descriptors, baseValues({ ssn: '123-45-6789' }))
    expect(fields).toContainEqual({ key: 'ssn', value: '123-45-6789' })
  })
})

describe('redacted (masked) fields', () => {
  it('flags a masked SSN as redacted and surfaces the mask as a placeholder', () => {
    const descriptors = buildW9FieldDescriptors(w9Document())
    const ssn = descriptors.find(d => d.name === 'ssn')
    expect(ssn).toMatchObject({
      name: 'ssn',
      hasRedactedValue: true,
      placeholder: 'XXX-XX-3123',
      isRequired: true,
    })
  })

  it('does not flag an unmasked sensitive value (EIN "N/A") as redacted', () => {
    const descriptors = buildW9FieldDescriptors(w9Document())
    const ein = descriptors.find(d => d.name === 'ein')
    expect(ein).toMatchObject({ name: 'ein', hasRedactedValue: false })
  })
})
