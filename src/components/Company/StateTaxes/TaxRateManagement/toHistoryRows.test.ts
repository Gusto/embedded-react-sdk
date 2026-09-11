import { describe, expect, it } from 'vitest'
import { extractRequirementColumns, toHistoryRows } from './toHistoryRows'
import type { TaxRequirementSet } from '@gusto/embedded-api/models/components/taxrequirementset'

const set = (overrides: Partial<TaxRequirementSet> = {}): TaxRequirementSet => ({
  state: 'GA',
  key: 'taxrates',
  label: 'Tax Rates',
  effectiveFrom: '2022-01-01',
  requirements: [{ key: 'rate', label: 'Total Tax Rate', value: '0.05', editable: true }],
  ...overrides,
})

describe('toHistoryRows', () => {
  it('ignores sets without an effectiveFrom', () => {
    expect(toHistoryRows([set({ effectiveFrom: null }), set()])).toHaveLength(1)
  })

  it('tags a single past-dated set as current', () => {
    const rows = toHistoryRows([set({ effectiveFrom: '2022-01-01' })])
    expect(rows).toEqual([
      expect.objectContaining({ effectiveFrom: '2022-01-01', status: 'current' }),
    ])
  })

  it('tags the most recent past set current, earlier sets historical, and future sets scheduled', () => {
    const rows = toHistoryRows([
      set({ effectiveFrom: '2022-01-01' }),
      set({ effectiveFrom: '2022-04-01' }),
      set({ effectiveFrom: '2027-01-01' }),
    ])
    expect(rows.map(row => [row.effectiveFrom, row.status])).toEqual([
      ['2022-01-01', 'historical'],
      ['2022-04-01', 'current'],
      ['2027-01-01', 'scheduled'],
    ])
  })

  it('excludes non-editable requirements from row values', () => {
    const rows = toHistoryRows([
      set({
        requirements: [
          { key: 'rate', label: 'Total Tax Rate', value: '0.05', editable: true },
          { key: 'internal', label: 'Internal', value: 'x', editable: false },
        ],
      }),
    ])
    expect(rows[0]!.values).toEqual({ rate: '0.05' })
  })

  // SDK-1115: TaxRequirement.key isn't guaranteed unique within one set (same root cause as
  // StateTaxesForm's same-key TaxRequirementSet bug). Without disambiguation, the second
  // requirement's value would silently overwrite the first's in the same row.
  it('disambiguates requirements sharing a key instead of one overwriting the other', () => {
    const rows = toHistoryRows([
      set({
        requirements: [
          { key: 'rate', label: 'Rate A', value: '0.05', editable: true },
          { key: 'rate', label: 'Rate B', value: '0.07', editable: true },
        ],
      }),
    ])
    expect(rows[0]!.values).toEqual({ rate: '0.05', 'rate--dup1': '0.07' })
  })
})

describe('extractRequirementColumns', () => {
  it('returns the union of editable requirement keys/labels in first-seen order', () => {
    const columns = extractRequirementColumns([
      set({
        effectiveFrom: '2022-01-01',
        requirements: [{ key: 'a', label: 'A', editable: true }],
      }),
      set({
        effectiveFrom: '2022-04-01',
        requirements: [
          { key: 'a', label: 'A', editable: true },
          { key: 'b', label: 'B', editable: true },
          { key: 'internal', label: 'Internal', editable: false },
        ],
      }),
    ])
    expect(columns).toEqual([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ])
  })

  it('returns a distinct column per requirement sharing a key, instead of deduping them together', () => {
    const columns = extractRequirementColumns([
      set({
        requirements: [
          { key: 'rate', label: 'Rate A', editable: true },
          { key: 'rate', label: 'Rate B', editable: true },
        ],
      }),
    ])
    expect(columns).toEqual([
      { key: 'rate', label: 'Rate A' },
      { key: 'rate--dup1', label: 'Rate B' },
    ])
  })
})
