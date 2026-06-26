import { describe, expect, it } from 'vitest'
import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import {
  createContractorSignatureFormSchema,
  ContractorSignatureFormErrorCodes,
} from './contractorSignatureFormSchema'
import {
  buildW9Defaults,
  buildW9FieldDescriptors,
  LLC_CLASSIFICATION_FIELD,
  TAX_CLASSIFICATION_FIELD,
  type ContractorSignatureFormData,
} from './w9Fields'

function w9Document(): Document {
  return {
    uuid: 'doc-1',
    name: 'taxpayer_identification_form_w_9',
    title: 'W-9',
    requiresSigning: true,
    fields: [
      { key: 'name', value: 'Klay Thompson', dataType: 'full_name', required: true },
      { key: 'individual_proprietor', value: null, dataType: 'checkbox', required: true },
      { key: 'c_corporation', value: null, dataType: 'checkbox', required: true },
      { key: 'limited_liability_company', value: null, dataType: 'checkbox', required: true },
      { key: 'other', value: null, dataType: 'checkbox', required: true },
      {
        key: 'home_address_street_1',
        value: '525 7th street',
        dataType: 'home_address_street_1',
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
      { key: 'ssn', value: 'XXX-XX-3123', dataType: 'ssn', required: true },
      { key: 'ein', value: 'N/A', dataType: 'ein', required: true },
      { key: 'signature_text', value: null, dataType: 'signature', required: true },
      { key: 'date', value: '9/17/2025', dataType: 'date', required: true },
    ],
  }
}

const descriptors = buildW9FieldDescriptors(w9Document())
const schema = createContractorSignatureFormSchema(descriptors)

function validValues(
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

function errorCodesByPath(values: ContractorSignatureFormData): Record<string, string> {
  const result = schema.safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map(issue => [String(issue.path[0]), issue.message]),
  )
}

describe('createContractorSignatureFormSchema', () => {
  it('accepts a fully populated, agreed-to submission', () => {
    expect(schema.safeParse(validValues()).success).toBe(true)
  })

  it('requires the agree checkbox', () => {
    expect(errorCodesByPath(validValues({ agree: false }))).toMatchObject({
      agree: ContractorSignatureFormErrorCodes.AGREE_REQUIRED,
    })
  })

  it('requires the federal tax classification', () => {
    expect(errorCodesByPath(validValues({ [TAX_CLASSIFICATION_FIELD]: '' }))).toMatchObject({
      [TAX_CLASSIFICATION_FIELD]: ContractorSignatureFormErrorCodes.REQUIRED,
    })
  })

  it('requires prefilled-but-cleared required fields', () => {
    expect(errorCodesByPath(validValues({ name: '', signature_text: '' }))).toMatchObject({
      name: ContractorSignatureFormErrorCodes.REQUIRED,
      signature_text: ContractorSignatureFormErrorCodes.REQUIRED,
    })
  })

  it('requires the LLC code only while the LLC classification is selected', () => {
    expect(
      errorCodesByPath(validValues({ [TAX_CLASSIFICATION_FIELD]: 'limited_liability_company' })),
    ).toMatchObject({
      [LLC_CLASSIFICATION_FIELD]: ContractorSignatureFormErrorCodes.REQUIRED,
    })

    expect(
      schema.safeParse(
        validValues({
          [TAX_CLASSIFICATION_FIELD]: 'limited_liability_company',
          [LLC_CLASSIFICATION_FIELD]: 'c',
        }),
      ).success,
    ).toBe(true)
  })

  it('treats the Other free-text field as optional', () => {
    expect(schema.safeParse(validValues({ [TAX_CLASSIFICATION_FIELD]: 'other' })).success).toBe(
      true,
    )
  })
})
