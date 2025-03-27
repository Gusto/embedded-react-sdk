import { expect, describe, it } from 'vitest'
import { removeNonDigits, snakeCaseToCamelCase } from './formattedStrings'

describe('formattedStrings', () => {
  describe('removeNonDigits', () => {
    it('should return empty string for empty input', () => {
      expect(removeNonDigits('')).toBe('')
    })

    it('should remove non-digits', () => {
      expect(removeNonDigits('a12-34/5 6b_78@90)')).toBe('1234567890')
    })
  })

  describe('snakeCaseToCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeCaseToCamelCase('hello_world')).toBe('helloWorld')
    })

    it('should handle multiple underscores', () => {
      expect(snakeCaseToCamelCase('first_name_last_name')).toBe('firstNameLastName')
    })

    it('should handle single word without underscores', () => {
      expect(snakeCaseToCamelCase('hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(snakeCaseToCamelCase('')).toBe('')
    })
  })
})
