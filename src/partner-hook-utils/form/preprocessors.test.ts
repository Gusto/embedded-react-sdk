import { describe, expect, it } from 'vitest'
import { coerceNaN, coerceStringBoolean, coerceToISODate } from './preprocessors'

describe('coerceToISODate', () => {
  it('serializes a Date using its local calendar day, not the UTC day', () => {
    // A DatePicker always produces local-midnight Dates. Serializing via
    // toISOString() would shift this to '2025-12-31' in any timezone ahead of UTC.
    expect(coerceToISODate(new Date(2026, 0, 1))).toBe('2026-01-01')
  })

  it('passes through non-Date values unchanged', () => {
    expect(coerceToISODate('2026-01-01')).toBe('2026-01-01')
  })

  it('returns null for empty input', () => {
    expect(coerceToISODate(null)).toBeNull()
    expect(coerceToISODate(undefined)).toBeNull()
    expect(coerceToISODate('')).toBeNull()
  })

  it('returns null for an invalid Date instead of throwing', () => {
    expect(coerceToISODate(new Date('invalid'))).toBeNull()
  })
})

describe('coerceNaN', () => {
  it('substitutes the fallback for null, undefined, and NaN', () => {
    expect(coerceNaN(0)(null)).toBe(0)
    expect(coerceNaN(0)(undefined)).toBe(0)
    expect(coerceNaN(0)(NaN)).toBe(0)
  })

  it('passes through valid numbers unchanged', () => {
    expect(coerceNaN(0)(5)).toBe(5)
  })
})

describe('coerceStringBoolean', () => {
  it('converts the string "true" to boolean true', () => {
    expect(coerceStringBoolean('true')).toBe(true)
  })

  it('converts any other string to boolean false', () => {
    expect(coerceStringBoolean('false')).toBe(false)
    expect(coerceStringBoolean('anything')).toBe(false)
  })

  it('passes through non-string values unchanged', () => {
    expect(coerceStringBoolean(true)).toBe(true)
    expect(coerceStringBoolean(undefined)).toBeUndefined()
  })
})
