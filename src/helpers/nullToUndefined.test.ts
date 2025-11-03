import { describe, it, expect } from 'vitest'
import { nullToUndefined } from './nullToUndefined'

describe('nullToUndefined', () => {
  it('converts null to undefined', () => {
    expect(nullToUndefined(null)).toBe(undefined)
  })

  it('preserves undefined', () => {
    expect(nullToUndefined(undefined)).toBe(undefined)
  })

  it('preserves primitive values', () => {
    expect(nullToUndefined('string')).toBe('string')
    expect(nullToUndefined(123)).toBe(123)
    expect(nullToUndefined(true)).toBe(true)
    expect(nullToUndefined(false)).toBe(false)
  })

  it('converts null in simple objects', () => {
    const input = {
      name: 'test',
      description: null,
      count: 42,
    }
    const result = nullToUndefined(input)
    expect(result).toEqual({
      name: 'test',
      description: undefined,
      count: 42,
    })
  })

  it('converts null in nested objects', () => {
    const input = {
      outer: {
        inner: {
          value: null,
          other: 'kept',
        },
      },
    }
    const result = nullToUndefined(input)
    expect(result).toEqual({
      outer: {
        inner: {
          value: undefined,
          other: 'kept',
        },
      },
    })
  })

  it('converts null in arrays', () => {
    const input = ['a', null, 'b', null]
    const result = nullToUndefined(input)
    expect(result).toEqual(['a', undefined, 'b', undefined])
  })

  it('converts null in arrays of objects', () => {
    const input = [
      { name: 'first', description: null },
      { name: 'second', description: 'has description' },
      { name: 'third', description: null },
    ]
    const result = nullToUndefined(input)
    expect(result).toEqual([
      { name: 'first', description: undefined },
      { name: 'second', description: 'has description' },
      { name: 'third', description: undefined },
    ])
  })

  it('handles complex nested structures', () => {
    const input = {
      employee: {
        name: 'John',
        reimbursements: [
          { amount: '100', description: null, uuid: null },
          { amount: '200', description: 'Travel', uuid: 'abc-123' },
        ],
        benefits: null,
      },
      paymentMethod: 'Direct Deposit',
    }
    const result = nullToUndefined(input)
    expect(result).toEqual({
      employee: {
        name: 'John',
        reimbursements: [
          { amount: '100', description: undefined, uuid: undefined },
          { amount: '200', description: 'Travel', uuid: 'abc-123' },
        ],
        benefits: undefined,
      },
      paymentMethod: 'Direct Deposit',
    })
  })

  it('handles empty objects and arrays', () => {
    expect(nullToUndefined({})).toEqual({})
    expect(nullToUndefined([])).toEqual([])
  })

  it('preserves empty strings', () => {
    const input = { value: '' }
    const result = nullToUndefined(input)
    expect(result).toEqual({ value: '' })
  })

  it('preserves zero values', () => {
    const input = { count: 0, amount: 0 }
    const result = nullToUndefined(input)
    expect(result).toEqual({ count: 0, amount: 0 })
  })
})
