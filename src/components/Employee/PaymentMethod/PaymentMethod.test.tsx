import { describe, expect, it } from 'vitest'
import { CombinedSchema } from './usePaymentMethod'

// Tests for percentage split validation with enhanced error messages
describe('PaymentMethod - Percentage Split Validation', () => {
  describe('splitAmount validation', () => {
    it('should pass when percentages add up to exactly 100', () => {
      const validData = {
        type: 'Direct Deposit' as const,
        isSplit: true as const,
        hasBankPayload: false as const,
        splitBy: 'Percentage' as const,
        splitAmount: {
          'account-1': 60,
          'account-2': 40,
        },
        priority: {
          'account-1': 1,
          'account-2': 2,
        },
      }

      const result = CombinedSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail when percentages add up to less than 100', () => {
      const invalidData = {
        type: 'Direct Deposit' as const,
        isSplit: true as const,
        hasBankPayload: false as const,
        splitBy: 'Percentage' as const,
        splitAmount: {
          'account-1': 50,
          'account-2': 40,
        },
        priority: {
          'account-1': 1,
          'account-2': 2,
        },
      }

      const result = CombinedSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['splitAmount'])
        expect(result.error.issues[0]?.message).toBe('percentage_split_total_error:90')
      }
    })

    it('should fail when percentages add up to more than 100', () => {
      const invalidData = {
        type: 'Direct Deposit' as const,
        isSplit: true as const,
        hasBankPayload: false as const,
        splitBy: 'Percentage' as const,
        splitAmount: {
          'account-1': 60,
          'account-2': 50,
        },
        priority: {
          'account-1': 1,
          'account-2': 2,
        },
      }

      const result = CombinedSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['splitAmount'])
        expect(result.error.issues[0]?.message).toBe('percentage_split_total_error:110')
      }
    })

    it('should handle multiple accounts correctly', () => {
      const validData = {
        type: 'Direct Deposit' as const,
        isSplit: true as const,
        hasBankPayload: false as const,
        splitBy: 'Percentage' as const,
        splitAmount: {
          'account-1': 25,
          'account-2': 35,
          'account-3': 40,
        },
        priority: {
          'account-1': 1,
          'account-2': 2,
          'account-3': 3,
        },
      }

      const result = CombinedSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject negative percentages', () => {
      const invalidData = {
        type: 'Direct Deposit' as const,
        isSplit: true as const,
        hasBankPayload: false as const,
        splitBy: 'Percentage' as const,
        splitAmount: {
          'account-1': -10,
          'account-2': 110,
        },
        priority: {
          'account-1': 1,
          'account-2': 2,
        },
      }

      const result = CombinedSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject percentages over 100 for individual accounts', () => {
      const invalidData = {
        type: 'Direct Deposit' as const,
        isSplit: true as const,
        hasBankPayload: false as const,
        splitBy: 'Percentage' as const,
        splitAmount: {
          'account-1': 150,
          'account-2': -50,
        },
        priority: {
          'account-1': 1,
          'account-2': 2,
        },
      }

      const result = CombinedSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    describe('enhanced error messages', () => {
      // Enhanced behavior: Error messages include current total for UI translation

      const testCases = [
        {
          name: 'under 100%',
          splitAmount: { 'account-1': 30, 'account-2': 40 },
          currentTotal: 70,
          expectedMessage: 'percentage_split_total_error:70',
        },
        {
          name: 'over 100%',
          splitAmount: { 'account-1': 60, 'account-2': 50 },
          currentTotal: 110,
          expectedMessage: 'percentage_split_total_error:110',
        },
        {
          name: 'multiple accounts under 100%',
          splitAmount: { 'account-1': 25, 'account-2': 35, 'account-3': 25 },
          currentTotal: 85,
          expectedMessage: 'percentage_split_total_error:85',
        },
      ]

      testCases.forEach(({ name, splitAmount, currentTotal, expectedMessage }) => {
        it(`should show specific total for ${name}`, () => {
          const invalidData = {
            type: 'Direct Deposit' as const,
            isSplit: true as const,
            hasBankPayload: false as const,
            splitBy: 'Percentage' as const,
            splitAmount,
            priority: Object.keys(splitAmount).reduce<Record<string, number>>((acc, key, index) => {
              acc[key] = index + 1
              return acc
            }, {}),
          }

          const result = CombinedSchema.safeParse(invalidData)
          expect(result.success).toBe(false)

          if (!result.success) {
            // Enhanced behavior: error message format includes current total for UI translation
            expect(result.error.issues[0]?.message).toBe(expectedMessage)

            // Verify the math calculation is correct
            const actualTotal = Object.values(splitAmount).reduce(
              (sum: number, value: number) => sum + value,
              0,
            )
            expect(actualTotal).toBe(currentTotal)
          }
        })
      })
    })
  })
})
