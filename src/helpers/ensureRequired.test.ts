import { describe, expect, it } from 'vitest'
import { ensureRequired } from './ensureRequired'

describe('ensureRequired', () => {
  it('should return the value when it is defined', () => {
    const value = 'test'
    expect(ensureRequired(value)).toBe(value)
  })

  it('should return the value when it is 0', () => {
    const value = 0
    expect(ensureRequired(value)).toBe(value)
  })

  it('should return the value when it is false', () => {
    const value = false
    expect(ensureRequired(value)).toBe(value)
  })

  it('should throw an error when value is undefined', () => {
    expect(() => ensureRequired(undefined)).toThrow()
  })
})
