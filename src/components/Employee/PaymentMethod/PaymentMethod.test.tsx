import { describe, expect, it } from 'vitest'
import { CombinedSchema } from './usePaymentMethod'

// Tests for percentage split validation
// Bug: Error messages not displayed when splits don't total 100%
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
        // TODO: Should show current total: 'Splits must total 100%. Currently 90%.'
        expect(result.error.issues[0]?.message).toBe('Must be 100')
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
        // TODO: Should show current total: 'Splits must total 100%. Currently 110%.'
        expect(result.error.issues[0]?.message).toBe('Must be 100')
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

    it('should provide helpful error messages (future enhancement)', () => {
      // Demonstrates ideal error messages with current totals

      const testCases = [
        {
          splitAmount: { 'account-1': 30, 'account-2': 40 },
          expectedMessage: 'Splits must total 100%. Currently 70%.',
        },
        {
          splitAmount: { 'account-1': 60, 'account-2': 50 },
          expectedMessage: 'Splits must total 100%. Currently 110%.',
        },
        {
          splitAmount: { 'account-1': 25, 'account-2': 35, 'account-3': 25 },
          expectedMessage: 'Splits must total 100%. Currently 85%.',
        },
      ]

      testCases.forEach(({ splitAmount }) => {
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
          expect(result.error.issues[0]?.message).toBe('Must be 100')
          // TODO: Should show actual total (see expectedMessage above)
        }
      })
    })
  })
})
