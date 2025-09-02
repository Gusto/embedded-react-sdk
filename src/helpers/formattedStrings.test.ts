import { expect, describe, it } from 'vitest'
import type { TFunction } from 'i18next'
import {
  removeNonDigits,
  snakeCaseToCamelCase,
  camelCaseToSnakeCase,
  formatNumberAsCurrency,
  formatPayRate,
} from './formattedStrings'

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
  })

  describe('formatNumberAsCurrency', () => {
    it('should format numbers with comma separators and two decimal places', () => {
      expect(formatNumberAsCurrency(1000)).toBe('$1,000.00')
      expect(formatNumberAsCurrency(25.5)).toBe('$25.50')
      expect(formatNumberAsCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatPayRate', () => {
    const mockT = ((key: string, options?: { amount?: string; ns?: string }) => {
      const templates = {
        'payRateFormats.hourly': '{{amount}}/hr',
        'payRateFormats.weekly': '{{amount}}/yr',
        'payRateFormats.monthly': '{{amount}}/yr',
        'payRateFormats.yearly': '{{amount}}/yr',
        'payRateFormats.paycheck': '{{amount}}/paycheck',
      }
      const template = templates[key as keyof typeof templates] || key
      return options?.amount ? template.replace('{{amount}}', options.amount) : template
    }) as TFunction

    it('should format pay rates with basic functionality', () => {
      const result = formatPayRate({ rate: 25.5, paymentUnit: 'Hour', t: mockT })
      expect(typeof result).toBe('string')
      expect(result).toBe('$25.50/hr')
    })

    it('should handle different payment units', () => {
      const hourlyResult = formatPayRate({ rate: 25.5, paymentUnit: 'Hour', t: mockT })
      const yearlyResult = formatPayRate({ rate: 75000, paymentUnit: 'Year', t: mockT })
      const unknownResult = formatPayRate({ rate: 100, paymentUnit: 'Unknown', t: mockT })

      expect(typeof hourlyResult).toBe('string')
      expect(typeof yearlyResult).toBe('string')
      expect(typeof unknownResult).toBe('string')

      expect(hourlyResult).toBe('$25.50/hr')
      expect(yearlyResult).toBe('$75,000.00/yr')
      expect(unknownResult).toBe('$100.00') // Unknown units return just the amount
    })

    it('should handle weekly and monthly calculations correctly', () => {
      const weeklyResult = formatPayRate({ rate: 1000, paymentUnit: 'Week', t: mockT })
      const monthlyResult = formatPayRate({ rate: 5000, paymentUnit: 'Month', t: mockT })

      expect(typeof weeklyResult).toBe('string')
      expect(typeof monthlyResult).toBe('string')

      // Weekly: 1000 * 52 = 52000
      expect(weeklyResult).toBe('$52,000.00/yr')
      // Monthly: 5000 * 12 = 60000
      expect(monthlyResult).toBe('$60,000.00/yr')
    })
  })
})
