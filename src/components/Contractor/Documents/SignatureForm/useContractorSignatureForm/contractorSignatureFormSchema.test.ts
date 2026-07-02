import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import {
  createContractorSignatureFormSchema,
  ContractorSignatureFormErrorCodes,
  type ContractorSignatureFormData,
  type ContractorSignatureSchemaOptions,
} from './contractorSignatureFormSchema'

function baseValues(
  overrides: Partial<ContractorSignatureFormData> = {},
): ContractorSignatureFormData {
  return {
    name: 'Klay Thompson',
    businessName: '',
    taxClassification: 'c_corporation',
    llcClassificationCode: '',
    otherText: '',
    foreignPartners: false,
    exemptPayeeCode: '',
    exemptionFromFatca: '',
    homeAddressStreet1: '525 7th street',
    homeAddressStreet2: '',
    homeAddressCity: 'New York',
    homeAddressState: 'NY',
    homeAddressZip: '10022',
    accountNumber: '',
    companyName: '',
    // SSN arrives masked, so the form input is empty; the schema is built with
    // `ssnRedacted: true` to exempt it (a value is already on file).
    ssn: '',
    ein: 'N/A',
    signatureText: 'Klay Thompson',
    agree: true,
    ...overrides,
  }
}

function makeSchema(options: ContractorSignatureSchemaOptions = { ssnRedacted: true }): z.ZodType {
  const [schema] = createContractorSignatureFormSchema(options)
  return schema
}

function errorCodesByPath(
  schema: z.ZodType,
  values: ContractorSignatureFormData,
): Record<string, string> {
  const result = schema.safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map(issue => [String(issue.path[0]), issue.message]),
  )
}

describe('createContractorSignatureFormSchema', () => {
  it('accepts a fully populated, agreed-to submission', () => {
    expect(makeSchema().safeParse(baseValues()).success).toBe(true)
  })

  it('requires the agree checkbox', () => {
    expect(errorCodesByPath(makeSchema(), baseValues({ agree: false }))).toMatchObject({
      agree: ContractorSignatureFormErrorCodes.AGREE_REQUIRED,
    })
  })

  it('requires the federal tax classification', () => {
    expect(errorCodesByPath(makeSchema(), baseValues({ taxClassification: '' }))).toMatchObject({
      taxClassification: ContractorSignatureFormErrorCodes.REQUIRED,
    })
  })

  it('requires prefilled-but-cleared required fields', () => {
    expect(
      errorCodesByPath(makeSchema(), baseValues({ name: '', signatureText: '' })),
    ).toMatchObject({
      name: ContractorSignatureFormErrorCodes.REQUIRED,
      signatureText: ContractorSignatureFormErrorCodes.REQUIRED,
    })
  })

  it('treats the LLC code as optional even when the LLC classification is selected', () => {
    // The LLC code serializes into the W-9 `tax_classification` field, which the
    // document API marks `required: false` — the form must not invent a
    // requirement the API doesn't impose.
    expect(
      makeSchema().safeParse(baseValues({ taxClassification: 'limited_liability_company' }))
        .success,
    ).toBe(true)
  })

  it('treats the Other free-text field as optional', () => {
    expect(makeSchema().safeParse(baseValues({ taxClassification: 'other' })).success).toBe(true)
  })

  it('promotes the LLC code to required via optionalFieldsToRequire', () => {
    const schema = makeSchema({
      ssnRedacted: true,
      optionalFieldsToRequire: { create: ['llcClassificationCode'] },
    })
    expect(
      errorCodesByPath(schema, baseValues({ taxClassification: 'limited_liability_company' })),
    ).toMatchObject({
      llcClassificationCode: ContractorSignatureFormErrorCodes.REQUIRED,
    })
  })

  it('requires the SSN when it did not arrive redacted', () => {
    expect(
      errorCodesByPath(makeSchema({ ssnRedacted: false }), baseValues({ ssn: '' })),
    ).toMatchObject({
      ssn: ContractorSignatureFormErrorCodes.REQUIRED,
    })
  })

  it('exempts the EIN from required validation when it arrived redacted', () => {
    expect(
      makeSchema({ ssnRedacted: true, einRedacted: true }).safeParse(baseValues({ ein: '' }))
        .success,
    ).toBe(true)
  })

  it('accepts a valid formatted SSN', () => {
    expect(
      makeSchema({ ssnRedacted: false }).safeParse(baseValues({ ssn: '123-45-6789' })).success,
    ).toBe(true)
  })

  it('rejects a malformed SSN', () => {
    expect(
      errorCodesByPath(makeSchema({ ssnRedacted: false }), baseValues({ ssn: '123-45' })),
    ).toMatchObject({
      ssn: ContractorSignatureFormErrorCodes.INVALID_SSN,
    })
  })

  it('rejects an SSN re-typed as the on-file mask (the server would stamp the mask)', () => {
    expect(
      errorCodesByPath(makeSchema({ ssnRedacted: true }), baseValues({ ssn: 'XXX-XX-1111' })),
    ).toMatchObject({
      ssn: ContractorSignatureFormErrorCodes.INVALID_SSN,
    })
  })

  it('accepts the N/A sentinel for the SSN', () => {
    expect(makeSchema({ ssnRedacted: false }).safeParse(baseValues({ ssn: 'N/A' })).success).toBe(
      true,
    )
  })

  it('accepts a valid formatted EIN', () => {
    expect(makeSchema().safeParse(baseValues({ ein: '12-3456789' })).success).toBe(true)
  })

  it('rejects a malformed EIN', () => {
    expect(errorCodesByPath(makeSchema(), baseValues({ ein: '12-345' }))).toMatchObject({
      ein: ContractorSignatureFormErrorCodes.INVALID_EIN,
    })
  })

  it('promotes an optional field to required via optionalFieldsToRequire', () => {
    const schema = makeSchema({
      ssnRedacted: true,
      optionalFieldsToRequire: { create: ['businessName'] },
    })
    expect(errorCodesByPath(schema, baseValues({ businessName: '' }))).toMatchObject({
      businessName: ContractorSignatureFormErrorCodes.REQUIRED,
    })
    expect(schema.safeParse(baseValues({ businessName: 'Entercross Systems' })).success).toBe(true)
  })
})
