import { describe, it, expect } from 'vitest'
import { canonicalize, hashScenarioStructure } from './hash'

describe('canonicalize', () => {
  it('sorts object keys recursively', () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}')
    expect(canonicalize({ outer: { z: 1, a: 2 } })).toBe('{"outer":{"a":2,"z":1}}')
  })

  it('preserves array order', () => {
    expect(canonicalize([3, 1, 2])).toBe('[3,1,2]')
  })

  it('handles primitives and null', () => {
    expect(canonicalize('x')).toBe('"x"')
    expect(canonicalize(42)).toBe('42')
    expect(canonicalize(null)).toBe('null')
    expect(canonicalize(true)).toBe('true')
  })
})

describe('hashScenarioStructure', () => {
  it('produces identical hash for identical inputs', () => {
    const a = { name: 'x', list: [1, 2], nested: { a: 1, b: 2 } }
    const b = JSON.parse(JSON.stringify(a))
    expect(hashScenarioStructure(a)).toBe(hashScenarioStructure(b))
  })

  it('is insensitive to object key ordering', () => {
    const a = { name: 'x', domain: 'payroll', baseDemo: 'react_sdk_demo' }
    const b = { baseDemo: 'react_sdk_demo', domain: 'payroll', name: 'x' }
    expect(hashScenarioStructure(a)).toBe(hashScenarioStructure(b))
  })

  it('changes when a value changes', () => {
    const a = { rate: '85000' }
    const b = { rate: '95000' }
    expect(hashScenarioStructure(a)).not.toBe(hashScenarioStructure(b))
  })

  it('changes when a nested fragment-equivalent value changes', () => {
    const before = {
      decorations: {
        employees: [{ key: 'alice', compensation: { rate: '85000' } }],
      },
    }
    const after = {
      decorations: {
        employees: [{ key: 'alice', compensation: { rate: '95000' } }],
      },
    }
    expect(hashScenarioStructure(before)).not.toBe(hashScenarioStructure(after))
  })

  it('treats array order as significant', () => {
    expect(hashScenarioStructure([1, 2, 3])).not.toBe(hashScenarioStructure([3, 2, 1]))
  })

  it('returns hex-encoded SHA-256 (64 chars)', () => {
    expect(hashScenarioStructure({ a: 1 })).toMatch(/^[0-9a-f]{64}$/)
  })
})
