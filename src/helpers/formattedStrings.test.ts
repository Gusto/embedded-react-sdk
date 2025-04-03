import { expect, describe, it } from 'vitest'
import { removeNonDigits, snakeCaseToCamelCase, camelCaseToSnakeCase } from './formattedStrings'

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

  describe('camelCaseToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelCaseToSnakeCase('helloWorld')).toBe('hello_world')
    })

    it('should handle multiple capital letters', () => {
      expect(camelCaseToSnakeCase('firstNameLastName')).toBe('first_name_last_name')
    })

    it('should handle single word without capital letters', () => {
      expect(camelCaseToSnakeCase('hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(camelCaseToSnakeCase('')).toBe('')
    })

    it('should handle consecutive capital letters', () => {
      expect(camelCaseToSnakeCase('myXMLParser')).toBe('my_xml_parser')
    })

    it('should handle consecutive capital letters at start', () => {
      expect(camelCaseToSnakeCase('XMLParser')).toBe('xml_parser')
    })
  })
})
