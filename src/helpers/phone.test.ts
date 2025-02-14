import { describe, expect, it } from 'vitest'
import { normalizePhone, removeNonDigits } from './phone'

describe('phone', () => {
  describe('removeNonDigits', () => {
    it('should return empty string for empty input', () => {
      expect(removeNonDigits('')).toBe('')
    })

    it('should remove non-digits', () => {
      expect(removeNonDigits('a12-34/5 6b_78@90)')).toBe('1234567890')
    })
  })

  describe('normalizePhone', () => {
    it('should return empty string for empty input', () => {
      expect(normalizePhone('')).toBe('')
    })

    it('should format first 3 digits with parenthesis', () => {
      expect(normalizePhone('123')).toBe('(123')
    })

    it('should add space and format next 3 digits', () => {
      expect(normalizePhone('123456')).toBe('(123) 456')
    })

    it('should add hyphen when exceeding 6 digits', () => {
      expect(normalizePhone('1234567')).toBe('(123) 456-7')
    })

    it('should strip non-digits before formatting', () => {
      expect(normalizePhone('(123) abc 456-7890')).toBe('(123) 456-7890')
    })

    it('should truncate input longer than 10 digits', () => {
      expect(normalizePhone('12345678901234')).toBe('(123) 456-7890')
    })
  })
})
