import { describe, expect, it } from 'vitest'
import {
  createFederalTaxesSchema,
  type FederalTaxesOptionalFieldsToRequire,
} from './federalTaxesSchema'

describe('federalTaxesSchema validation', () => {
  const optionalFieldsToRequire: FederalTaxesOptionalFieldsToRequire = {
    update: ['twoJobs', 'dependentsAmount', 'otherIncome', 'deductions', 'extraWithholding'],
  }

  const baseValidPayload = {
    filingStatus: 'Single',
    twoJobs: false,
    dependentsAmount: 0,
    otherIncome: 0,
    deductions: 0,
    extraWithholding: 0,
  }

  function getRequiredErrors(
    result: ReturnType<ReturnType<typeof createFederalTaxesSchema>[0]['safeParse']>,
  ) {
    if (result.success) return []
    return result.error.issues.filter(i => i.message === 'REQUIRED').map(i => i.path.join('.'))
  }

  it('reports REQUIRED when a required currency field is cleared (NaN)', () => {
    const [schema] = createFederalTaxesSchema({ optionalFieldsToRequire })

    const result = schema.safeParse({ ...baseValidPayload, extraWithholding: NaN })

    expect(getRequiredErrors(result)).toContain('extraWithholding')
  })

  it('reports REQUIRED when a required currency field is undefined', () => {
    const [schema] = createFederalTaxesSchema({ optionalFieldsToRequire })

    const result = schema.safeParse({ ...baseValidPayload, extraWithholding: undefined })

    expect(getRequiredErrors(result)).toContain('extraWithholding')
  })

  it('accepts 0 as a valid value for required currency fields', () => {
    const [schema] = createFederalTaxesSchema({ optionalFieldsToRequire })

    const result = schema.safeParse(baseValidPayload)

    expect(result.success).toBe(true)
  })

  it('does not require currency fields when optionalFieldsToRequire is omitted', () => {
    const [schema] = createFederalTaxesSchema()

    const result = schema.safeParse({ ...baseValidPayload, extraWithholding: NaN })

    expect(result.success).toBe(true)
  })
})
