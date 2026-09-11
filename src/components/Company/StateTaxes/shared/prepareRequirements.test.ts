import { describe, expect, it } from 'vitest'
import { isRequirementSetEditable, prepareRequirements } from './prepareRequirements'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'

const req = (overrides: Partial<TaxRequirement> = {}): TaxRequirement => ({
  key: 'k',
  applicableIf: [],
  editable: true,
  ...overrides,
})

describe('prepareRequirements', () => {
  it('keeps a requirement with no applicableIf constraints', () => {
    const requirements = [req({ key: 'k1' })]
    expect(prepareRequirements(requirements)).toEqual([req({ key: 'k1' })])
  })

  it('drops a non-editable requirement unconditionally', () => {
    const requirements = [req({ key: 'k1', editable: false })]
    expect(prepareRequirements(requirements)).toEqual([])
  })

  it('drops a requirement whose applicableIf references a non-editable sibling with a non-matching value', () => {
    // Mirrors gws-flows spec/services/tax_requirements/edit_spec.rb: k1 depends on non-editable
    // k2 == 'x', but k2's actual value is 'v2' -> k1 can never be applicable.
    const requirements = [
      req({ key: 'k1', applicableIf: [{ key: 'k2', value: 'x' }] }),
      req({ key: 'k2', editable: false, value: 'v2' }),
    ]
    expect(prepareRequirements(requirements)).toEqual([])
  })

  it('drops the constraint (keeps the requirement, always applicable) when the non-editable sibling already matches', () => {
    // k3 depends on non-editable k2 == 'v2', which matches -> constraint dropped, k3 always shows.
    const requirements = [
      req({ key: 'k3', applicableIf: [{ key: 'k2', value: 'v2' }] }),
      req({ key: 'k2', editable: false, value: 'v2' }),
    ]
    expect(prepareRequirements(requirements)).toEqual([req({ key: 'k3', applicableIf: [] })])
  })

  it('keeps constraints referencing editable siblings untouched for dynamic resolution', () => {
    // k4 depends on k2 == 'v2' (non-editable, matches -> dropped) AND k3 == 'v3-other' (k3 is
    // editable -> kept, resolved later against live form values). k2 itself never appears in the
    // output — non-editable requirements never become form fields, mirroring Rails' `retain_requirement
    // && requirement.editable`.
    const requirements = [
      req({
        key: 'k4',
        applicableIf: [
          { key: 'k2', value: 'v2' },
          { key: 'k3', value: 'v3-other' },
        ],
      }),
      req({ key: 'k2', editable: false, value: 'v2' }),
      req({ key: 'k3' }),
    ]
    expect(prepareRequirements(requirements)).toEqual([
      req({ key: 'k4', applicableIf: [{ key: 'k3', value: 'v3-other' }] }),
      req({ key: 'k3' }),
    ])
  })

  it('resolves against the raw, un-stringified sibling value regardless of type', () => {
    // A non-editable sibling's value may be boolean/numeric on the wire; resolution must compare
    // against that raw value, not a stringified RHF default.
    const requirements = [
      req({ key: 'dependent', applicableIf: [{ key: 'sibling', value: true }] }),
      req({ key: 'sibling', editable: false, value: true }),
    ]
    expect(prepareRequirements(requirements)).toEqual([req({ key: 'dependent', applicableIf: [] })])
  })

  it('keeps a constraint whose referenced key has no matching sibling in the set', () => {
    const requirements = [req({ key: 'k1', applicableIf: [{ key: 'missing', value: 'x' }] })]
    expect(prepareRequirements(requirements)).toEqual([
      req({ key: 'k1', applicableIf: [{ key: 'missing', value: 'x' }] }),
    ])
  })
})

describe('isRequirementSetEditable', () => {
  it('returns true when at least one requirement survives preparation', () => {
    expect(isRequirementSetEditable([req({ key: 'k1' })])).toBe(true)
  })

  it('returns false when every requirement is non-editable', () => {
    expect(isRequirementSetEditable([req({ key: 'k1', editable: false })])).toBe(false)
  })

  it('returns false when every requirement is dropped by an unsatisfiable applicableIf', () => {
    const requirements = [
      req({ key: 'k1', applicableIf: [{ key: 'k2', value: 'x' }] }),
      req({ key: 'k2', editable: false, value: 'v2' }),
    ]
    expect(isRequirementSetEditable(requirements)).toBe(false)
  })
})
