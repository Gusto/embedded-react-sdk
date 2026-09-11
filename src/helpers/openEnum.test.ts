import { describe, expect, it } from 'vitest'
import { isKnownEnumValue, toKnownEnumValue } from './openEnum'

const Color = {
  Red: 'red',
  Blue: 'blue',
} as const

describe('isKnownEnumValue', () => {
  it('returns true for a known member value', () => {
    expect(isKnownEnumValue(Color.Red, Color)).toBe(true)
  })

  it('returns false for an unrecognized value', () => {
    expect(isKnownEnumValue('green', Color)).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect(isKnownEnumValue(null, Color)).toBe(false)
    expect(isKnownEnumValue(undefined, Color)).toBe(false)
  })

  it('narrows to the enum object member type, not string', () => {
    const value: string | undefined = Color.Blue
    if (isKnownEnumValue(value, Color)) {
      const narrowed: 'red' | 'blue' = value
      expect(narrowed).toBe('blue')
    } else {
      expect.fail('expected known value to narrow')
    }
  })
})

describe('toKnownEnumValue', () => {
  it('returns the value when it is a known member', () => {
    expect(toKnownEnumValue(Color.Red, Color, undefined)).toBe('red')
  })

  it('returns the fallback for an unrecognized value', () => {
    expect(toKnownEnumValue('green', Color, undefined)).toBeUndefined()
  })

  it('returns the fallback for null and undefined', () => {
    expect(toKnownEnumValue(null, Color, Color.Blue)).toBe('blue')
    expect(toKnownEnumValue(undefined, Color, Color.Blue)).toBe('blue')
  })
})
