import { describe, expect, it } from 'vitest'
import { normalizeEin } from './federalEin'

describe('normalizeEin', () => {
  it('should return empty string for empty input', () => {
    expect(normalizeEin('')).toBe('')
  })

  it('should format complete EIN correctly', () => {
    expect(normalizeEin('123456789')).toBe('12-3456789')
  })

  it('should handle partial EIN input', () => {
    expect(normalizeEin('123')).toBe('12-3')
  })

  it('should handle non-numeric input', () => {
    expect(normalizeEin('12abc3456789')).toBe('12-3456789')
  })
})
