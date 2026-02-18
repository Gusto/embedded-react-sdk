import { describe, expect, it } from 'vitest'
import { decimalToPercent, percentToDecimal, formatPercentLabel } from './percentageConversion'

describe('percentageConversion', () => {
  describe('decimalToPercent', () => {
    it('converts decimal string to percentage number', () => {
      expect(decimalToPercent('0.05')).toBe(5)
      expect(decimalToPercent('0.01')).toBe(1)
      expect(decimalToPercent('1')).toBe(100)
    })

    it('handles very small decimals with precision', () => {
      expect(decimalToPercent('0.0003')).toBe(0.03)
      expect(decimalToPercent('0.0002')).toBe(0.02)
      expect(decimalToPercent('0.0004')).toBe(0.04)
      expect(decimalToPercent('0.0024')).toBe(0.24)
    })

    it('avoids floating point errors', () => {
      expect(decimalToPercent('0.081')).toBe(8.1)
      expect(decimalToPercent('0.0812')).toBe(8.12)
      expect(decimalToPercent('0.015')).toBe(1.5)
      expect(decimalToPercent('0.062')).toBe(6.2)
    })

    it('handles zero', () => {
      expect(decimalToPercent('0')).toBe(0)
      expect(decimalToPercent('0.0')).toBe(0)
      expect(decimalToPercent(0)).toBe(0)
    })

    it('handles numeric input', () => {
      expect(decimalToPercent(0.05)).toBe(5)
      expect(decimalToPercent(0.0003)).toBe(0.03)
    })

    it('returns undefined for null/undefined/empty', () => {
      expect(decimalToPercent(null)).toBeUndefined()
      expect(decimalToPercent(undefined)).toBeUndefined()
      expect(decimalToPercent('')).toBeUndefined()
    })

    it('returns undefined for boolean values', () => {
      expect(decimalToPercent(true)).toBeUndefined()
      expect(decimalToPercent(false)).toBeUndefined()
    })

    it('returns undefined for non-numeric strings', () => {
      expect(decimalToPercent('abc')).toBeUndefined()
    })
  })

  describe('percentToDecimal', () => {
    it('converts percentage number to decimal string', () => {
      expect(percentToDecimal(5)).toBe('0.05')
      expect(percentToDecimal(1)).toBe('0.01')
      expect(percentToDecimal(100)).toBe('1')
    })

    it('handles small percentage values with precision', () => {
      expect(percentToDecimal(0.03)).toBe('0.0003')
      expect(percentToDecimal(0.02)).toBe('0.0002')
      expect(percentToDecimal(0.04)).toBe('0.0004')
      expect(percentToDecimal(0.24)).toBe('0.0024')
    })

    it('avoids floating point errors', () => {
      expect(percentToDecimal(8.1)).toBe('0.081')
      expect(percentToDecimal(8.12)).toBe('0.0812')
      expect(percentToDecimal(1.5)).toBe('0.015')
      expect(percentToDecimal(6.2)).toBe('0.062')
    })

    it('handles zero', () => {
      expect(percentToDecimal(0)).toBe('0')
    })

    it('handles string input', () => {
      expect(percentToDecimal('5')).toBe('0.05')
      expect(percentToDecimal('0.03')).toBe('0.0003')
    })

    it('passes through non-numeric strings unchanged', () => {
      expect(percentToDecimal('abc')).toBe('abc')
    })
  })

  describe('formatPercentLabel', () => {
    it('formats decimal values as pretty percentage labels', () => {
      expect(formatPercentLabel('0.0')).toBe('0.0%')
      expect(formatPercentLabel('0.001')).toBe('0.1%')
      expect(formatPercentLabel('0.0002')).toBe('0.02%')
      expect(formatPercentLabel('0.0003')).toBe('0.03%')
      expect(formatPercentLabel('0.05')).toBe('5.0%')
      expect(formatPercentLabel('0.034')).toBe('3.4%')
    })

    it('returns original string for non-numeric input', () => {
      expect(formatPercentLabel('abc')).toBe('abc')
    })
  })

  describe('round-trip conversion', () => {
    it('preserves values through decimal -> percent -> decimal', () => {
      const testValues = ['0.05', '0.0003', '0.081', '0.0812', '0.0024', '0.015', '0.062']

      for (const original of testValues) {
        const percent = decimalToPercent(original)
        expect(percent).toBeDefined()
        const backToDecimal = percentToDecimal(percent!)
        expect(backToDecimal).toBe(original)
      }
    })
  })
})
