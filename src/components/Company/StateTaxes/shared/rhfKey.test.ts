import { describe, expect, it } from 'vitest'
import { fromRhfKey, getUniqueRhfKey, toRhfKey } from './rhfKey'

describe('toRhfKey / fromRhfKey', () => {
  it('round-trips a key containing a pipe', () => {
    const key = 'wa_wc_hourly_rate|010103'
    expect(fromRhfKey(toRhfKey(key))).toBe(key)
  })

  it('leaves a key without a pipe unchanged', () => {
    expect(toRhfKey('plain-key')).toBe('plain-key')
  })
})

describe('getUniqueRhfKey', () => {
  it('returns the plain rhf key when no other requirement shares it', () => {
    const requirements = [{ key: 'aaa' }, { key: 'bbb' }]
    expect(getUniqueRhfKey(requirements[0]!, 0, requirements)).toBe('aaa')
    expect(getUniqueRhfKey(requirements[1]!, 1, requirements)).toBe('bbb')
  })

  it('disambiguates a later requirement that shares a key with an earlier one', () => {
    const requirements = [{ key: 'aaa' }, { key: 'aaa' }, { key: 'aaa' }]
    expect(getUniqueRhfKey(requirements[0]!, 0, requirements)).toBe('aaa')
    expect(getUniqueRhfKey(requirements[1]!, 1, requirements)).toBe('aaa--dup1')
    expect(getUniqueRhfKey(requirements[2]!, 2, requirements)).toBe('aaa--dup2')
  })

  it('only counts duplicates among requirements sharing the exact same key', () => {
    const requirements = [{ key: 'aaa' }, { key: 'bbb' }, { key: 'aaa' }]
    expect(getUniqueRhfKey(requirements[2]!, 2, requirements)).toBe('aaa--dup1')
  })

  it('is stable regardless of pipe-containing keys', () => {
    const requirements = [{ key: 'wa_wc_hourly_rate|010103' }, { key: 'wa_wc_hourly_rate|010103' }]
    expect(getUniqueRhfKey(requirements[0]!, 0, requirements)).toBe(
      'wa_wc_hourly_rate__PIPE__010103',
    )
    expect(getUniqueRhfKey(requirements[1]!, 1, requirements)).toBe(
      'wa_wc_hourly_rate__PIPE__010103--dup1',
    )
  })
})
