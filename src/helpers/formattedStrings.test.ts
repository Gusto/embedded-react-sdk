import { expect, describe, it } from 'vitest'
import { removeNonDigits } from './formattedStrings'

describe('formattedStrings', () => {
  describe('removeNonDigits', () => {
    it('should return empty string for empty input', () => {
      expect(removeNonDigits('')).toBe('')
    })

    it('should remove non-digits', () => {
      expect(removeNonDigits('a12-34/5 6b_78@90)')).toBe('1234567890')
    })
  })
})
