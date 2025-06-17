import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeductionSchema } from './useDeductions'
import type { DeductionInputs } from './useDeductions'

describe('Deductions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DeductionSchema - annualMaximum Field', () => {
    it('transforms positive annualMaximum values to strings', () => {
      const input: DeductionInputs = {
        active: true,
        amount: 100,
        description: 'Test Deduction',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: 1500,
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      const result = DeductionSchema.parse(input)

      expect(result.annualMaximum).toBe('1500')
      expect(typeof result.annualMaximum).toBe('string')
    })

    it('converts zero annualMaximum to null', () => {
      const input: DeductionInputs = {
        active: true,
        amount: 50,
        description: 'Test Deduction',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: 0,
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      const result = DeductionSchema.parse(input)

      expect(result.annualMaximum).toBe(null)
    })

    it('rejects negative annualMaximum values', () => {
      const input: DeductionInputs = {
        active: true,
        amount: 75,
        description: 'Test Deduction',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: -100,
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      expect(() => DeductionSchema.parse(input)).toThrow(
        'Number must be greater than or equal to 0',
      )
    })

    it('handles null annualMaximum correctly', () => {
      const input: DeductionInputs = {
        active: true,
        amount: 25,
        description: 'Test Deduction',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: null,
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      const result = DeductionSchema.parse(input)

      expect(result.annualMaximum).toBe(null)
    })

    it('validates minimum value constraints', () => {
      const input: DeductionInputs = {
        active: true,
        amount: 100,
        description: 'Test Deduction',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: -50, // Below minimum
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      expect(() => DeductionSchema.parse(input)).toThrow()
    })

    it('transforms other numeric fields correctly alongside annualMaximum', () => {
      const input: DeductionInputs = {
        active: true,
        amount: 250.5,
        description: 'Test Deduction',
        courtOrdered: true,
        times: null,
        recurring: 'true',
        annualMaximum: 3000.75,
        payPeriodMaximum: 500.25,
        deductAsPercentage: 'false',
      }

      const result = DeductionSchema.parse(input)

      expect(result.amount).toBe('250.5') // Converted to string
      expect(result.annualMaximum).toBe('3000.75') // Converted to string
      expect(result.payPeriodMaximum).toBe('500.25') // Converted to string
      expect(result.recurring).toBe(true) // Boolean conversion
      expect(result.deductAsPercentage).toBe(false) // Boolean conversion
    })
  })

  describe('Field Name Migration', () => {
    it('uses annualMaximum field name', () => {
      const schemaKeys = Object.keys(DeductionSchema.shape)

      expect(schemaKeys).toContain('annualMaximum')
    })

    it('has the expected schema structure with annualMaximum', () => {
      const expectedKeys = [
        'active',
        'amount',
        'description',
        'courtOrdered',
        'times',
        'recurring',
        'annualMaximum',
        'payPeriodMaximum',
        'deductAsPercentage',
      ]

      const schemaKeys = Object.keys(DeductionSchema.shape)

      expectedKeys.forEach(key => {
        expect(schemaKeys).toContain(key)
      })
    })
  })

  describe('Business Logic Validation', () => {
    it('ensures data is included in payload when annualMaximum has value', () => {
      const inputWithValue: DeductionInputs = {
        active: true,
        amount: 100,
        description: 'Health Insurance',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: 2400, // Has a value
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      const result = DeductionSchema.parse(inputWithValue)

      // Verify the field exists in the output with the correct transformed value
      expect('annualMaximum' in result).toBe(true)
      expect(result.annualMaximum).toBe('2400')
    })

    it('ensures null values are properly handled in payload', () => {
      const inputWithNull: DeductionInputs = {
        active: true,
        amount: 50,
        description: 'Parking Fee',
        courtOrdered: false,
        times: null,
        recurring: 'true',
        annualMaximum: 0, // Zero value should become null
        payPeriodMaximum: null,
        deductAsPercentage: 'false',
      }

      const result = DeductionSchema.parse(inputWithNull)

      // Verify zero is converted to null
      expect('annualMaximum' in result).toBe(true)
      expect(result.annualMaximum).toBe(null)
    })
  })
})
