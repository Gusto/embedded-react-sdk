import { describe, expect, it } from 'vitest'
import { formatWithMask } from './mask'

describe('formatWithMask', () => {
  describe('digit placeholder (#)', () => {
    it('should format numbers according to the mask', () => {
      expect(formatWithMask('123456789', '###-##-####')).toBe('123-45-6789')
      expect(formatWithMask('123456', '##-###')).toBe('12-345')
    })

    it('should handle complex digit patterns', () => {
      expect(formatWithMask('123456789', '##-#####-#-##')).toBe('12-34567-8-9')
      expect(formatWithMask('123456789', '##-#####-#-##')).toBe('12-34567-8-9')
    })

    it('should skip non-digit characters in input', () => {
      expect(formatWithMask('123-456-789', '###-##-####')).toBe('123-45-6789')
      expect(formatWithMask('ABC123', '###-###')).toBe('123')
    })
  })

  describe('letter placeholder (@)', () => {
    it('should format letters according to the mask', () => {
      expect(formatWithMask('ABC123', '@@@-###')).toBe('ABC-123')
      expect(formatWithMask('ABCDEF', '@@@-@@@')).toBe('ABC-DEF')
    })

    it('should skip non-letter characters in input', () => {
      expect(formatWithMask('123ABC', '@@@-###')).toBe('ABC')
      expect(formatWithMask('ABC-123', '@@@-###')).toBe('ABC-123')
    })
  })

  describe('uppercase letter placeholder (^)', () => {
    it('should format uppercase letters according to the mask', () => {
      expect(formatWithMask('ABC123', '^^^-###')).toBe('ABC-123')
      expect(formatWithMask('ABCDEF', '^^^-^^^')).toBe('ABC-DEF')
    })

    it('should skip non-uppercase characters in input', () => {
      expect(formatWithMask('abcABC', '^^^-###')).toBe('ABC')
      expect(formatWithMask('ABC-123', '^^^-###')).toBe('ABC-123')
    })
  })

  describe('digit or uppercase letter placeholder (%)', () => {
    it('should format digits and uppercase letters according to the mask', () => {
      expect(formatWithMask('A1B2C3', '%%%-%%%')).toBe('A1B-2C3')
      expect(formatWithMask('ABC123', '%%%-%%%')).toBe('ABC-123')
    })

    it('should skip non-matching characters in input', () => {
      expect(formatWithMask('a1b2c3', '%%%-%%%')).toBe('123')
      expect(formatWithMask('ABC-123', '%%%-%%%')).toBe('ABC-123')
    })
  })

  describe('literal characters', () => {
    it('should preserve literal characters in the mask', () => {
      expect(formatWithMask('123456', '(###) ###-####')).toBe('(123) 456')
      expect(formatWithMask('ABC123', '### ###')).toBe('123')
    })

    it('should handle literal characters that match input', () => {
      expect(formatWithMask('5', '5#-#####')).toBe('5')
      expect(formatWithMask('51', '5#-#####')).toBe('51')
      expect(formatWithMask('512', '5#-#####')).toBe('51-2')
      expect(formatWithMask('5123', '5#-#####')).toBe('51-23')
      expect(formatWithMask('51234', '5#-#####')).toBe('51-234')
      expect(formatWithMask('512345', '5#-#####')).toBe('51-2345')
    })

    it("should handle literal characters that don't match input", () => {
      expect(formatWithMask('1', '5#-#####')).toBe('51')
      expect(formatWithMask('12', '5#-#####')).toBe('51-2')
      expect(formatWithMask('123', '5#-#####')).toBe('51-23')
      expect(formatWithMask('1234', '5#-#####')).toBe('51-234')
      expect(formatWithMask('12345', '5#-#####')).toBe('51-2345')
    })
  })

  describe('edge cases', () => {
    it('should handle empty input', () => {
      expect(formatWithMask('', '###-##-####')).toBe('')
      expect(formatWithMask('', '@@@-###')).toBe('')
    })

    it('should handle input shorter than the mask', () => {
      expect(formatWithMask('123', '###-##-####')).toBe('123')
      expect(formatWithMask('ABC', '@@@-###')).toBe('ABC')
    })

    it('should handle input longer than the mask', () => {
      expect(formatWithMask('1234567890123', '###-##-####')).toBe('123-45-6789')
      expect(formatWithMask('ABC123DEF456', '@@@-###')).toBe('ABC-123')
    })
  })
})
