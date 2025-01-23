import { describe, expect, it } from 'vitest'
import {
  createResponsiveCustomProperties,
  isResponsiveValue,
  setResponsiveCustomProperties,
  toRemIfNumeric,
} from './responsive'

describe('toRemIfNumeric', () => {
  it('converts numeric values to rem units', () => {
    expect(toRemIfNumeric(16)).toBe('1rem')
  })

  it('passes through string values unchanged', () => {
    expect(toRemIfNumeric('100%')).toBe('100%')
  })
})

describe('isResponsiveValue', () => {
  it('returns true when value contains breakpoint keys', () => {
    const value = { base: '1fr', small: '1fr 1fr' }
    expect(isResponsiveValue(value)).toBe(true)
  })

  it('returns false for non-responsive values', () => {
    const value = ['1fr', '1fr']
    expect(isResponsiveValue(value)).toBe(false)
  })
})

describe('createResponsiveCustomProperties', () => {
  it('creates custom properties for responsive values', () => {
    const result = createResponsiveCustomProperties('grid-template-columns', {
      base: ['1fr'],
      small: ['1fr', 16],
    })

    expect(result).toEqual({
      '--g-grid-template-columns-base': '1fr',
      '--g-grid-template-columns-small': '1fr 1rem',
    })
  })

  it('creates a single custom property for non-responsive values', () => {
    const result = createResponsiveCustomProperties('gap', 16)

    expect(result).toEqual({
      '--g-gap-base': '1rem',
    })
  })
})

describe('setResponsiveCustomProperties', () => {
  it('creates custom properties for multiple responsive properties', () => {
    const result = setResponsiveCustomProperties({
      gap: { base: 16, small: 8 },
      'grid-template-columns': {
        base: ['1fr'],
        small: ['1fr', '1fr'],
      },
    })

    expect(result).toEqual({
      '--g-gap-base': '1rem',
      '--g-gap-small': '0.5rem',
      '--g-grid-template-columns-base': '1fr',
      '--g-grid-template-columns-small': '1fr 1fr',
    })
  })

  it('returns empty object when no properties provided', () => {
    expect(setResponsiveCustomProperties()).toEqual({})
  })
})
