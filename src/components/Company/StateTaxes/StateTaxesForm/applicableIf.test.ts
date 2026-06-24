import { describe, expect, it } from 'vitest'
import { isRequirementApplicable, type StateTaxesFormValues } from './applicableIf'
import type { TaxRequirement } from '@gusto/embedded-api-v-2025-11-15/models/components/taxrequirement'

const req = (overrides: Partial<TaxRequirement> = {}): TaxRequirement => ({
  key: 'rate',
  applicableIf: [],
  ...overrides,
})

describe('isRequirementApplicable', () => {
  it('returns true when applicableIf is missing', () => {
    expect(isRequirementApplicable(req({ applicableIf: undefined }), 'taxrates', {})).toBe(true)
  })

  it('returns true when applicableIf is empty', () => {
    expect(isRequirementApplicable(req({ applicableIf: [] }), 'taxrates', {})).toBe(true)
  })

  it('returns true when a single constraint matches the form value', () => {
    const formValues: StateTaxesFormValues = {
      taxrates: { usedefaultsuirates: false },
    }
    const requirement = req({
      applicableIf: [{ key: 'usedefaultsuirates', value: false }],
    })
    expect(isRequirementApplicable(requirement, 'taxrates', formValues)).toBe(true)
  })

  it('returns false when a single constraint does not match', () => {
    const formValues: StateTaxesFormValues = {
      taxrates: { usedefaultsuirates: true },
    }
    const requirement = req({
      applicableIf: [{ key: 'usedefaultsuirates', value: false }],
    })
    expect(isRequirementApplicable(requirement, 'taxrates', formValues)).toBe(false)
  })

  it('requires every constraint to match (AND-logic)', () => {
    const formValues: StateTaxesFormValues = {
      taxrates: { suireimbursable: false, usedefaultsuirates: false },
    }
    const requirement = req({
      applicableIf: [
        { key: 'suireimbursable', value: false },
        { key: 'usedefaultsuirates', value: false },
      ],
    })
    expect(isRequirementApplicable(requirement, 'taxrates', formValues)).toBe(true)

    const partialMatch: StateTaxesFormValues = {
      taxrates: { suireimbursable: false, usedefaultsuirates: true },
    }
    expect(isRequirementApplicable(requirement, 'taxrates', partialMatch)).toBe(false)
  })

  it('returns false when the requirement set has no form values yet', () => {
    const requirement = req({
      applicableIf: [{ key: 'usedefaultsuirates', value: false }],
    })
    expect(isRequirementApplicable(requirement, 'taxrates', {})).toBe(false)
  })

  it('round-trips constraint keys through toRhfKey', () => {
    const formValues: StateTaxesFormValues = {
      taxrates: { wa_wc_hourly_rate__PIPE__010103: true },
    }
    const requirement = req({
      applicableIf: [{ key: 'wa_wc_hourly_rate|010103', value: true }],
    })
    expect(isRequirementApplicable(requirement, 'taxrates', formValues)).toBe(true)
  })
})
