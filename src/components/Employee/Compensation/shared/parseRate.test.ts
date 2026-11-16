import { describe, expect, it } from 'vitest'
import { parseRate } from './parseRate'

describe('parseRate', () => {
  it('parses a decimal rate string', () => {
    expect(parseRate('60.00')).toBe(60)
  })

  it('returns null when there is no usable value', () => {
    expect(parseRate(undefined)).toBeNull()
    expect(parseRate('')).toBeNull()
    expect(parseRate('not a rate')).toBeNull()
  })
})
