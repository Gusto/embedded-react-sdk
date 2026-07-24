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
})
