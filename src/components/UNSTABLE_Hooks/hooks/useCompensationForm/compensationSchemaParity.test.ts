/**
 * Compensation Schema Parity Tests
 *
 * Verifies that the UNSTABLE useCompensationForm schema and the Employee
 * Compensation schema enforce identical business validation rules.
 *
 * Both schemas encode FLSA, rate, payment unit, minimum wage, and workers' comp
 * logic. This suite ensures they stay in sync as each evolves independently.
 *
 * The UNSTABLE schema is configured with { mode: 'create', withStartDateField: false }
 * to align with the Employee schema, which has no mode concept and no startDate field.
 */
import { describe, it, expect } from 'vitest'
import { CompensationSchema as EmployeeSchema } from '@/components/Employee/Compensation/useCompensation'
import { createCompensationSchema } from './compensationSchema'
import { FlsaStatus, PAY_PERIODS } from '@/shared/constants'

const [HookSchema] = createCompensationSchema({
  mode: 'create',
  withStartDateField: false,
})

type FlsaStatusValue = (typeof FlsaStatus)[keyof typeof FlsaStatus]
type PaymentUnitValue = (typeof PAY_PERIODS)[keyof typeof PAY_PERIODS]

interface SchemaInput {
  jobTitle: string
  flsaStatus: FlsaStatusValue
  paymentUnit: PaymentUnitValue
  rate: number
  adjustForMinimumWage: boolean
  minimumWageId: string
  stateWcCovered: boolean
  stateWcClassCode: string
  twoPercentShareholder: boolean
}

const BASE_VALID_INPUT: SchemaInput = {
  jobTitle: 'Software Engineer',
  flsaStatus: FlsaStatus.NONEXEMPT,
  paymentUnit: PAY_PERIODS.HOUR,
  rate: 50,
  adjustForMinimumWage: false,
  minimumWageId: '',
  stateWcCovered: false,
  stateWcClassCode: '',
  twoPercentShareholder: false,
}

function getErrorFields(result: {
  success: boolean
  error?: { issues: { path: PropertyKey[] }[] }
}) {
  if (result.success) return new Set<string>()
  return new Set(result.error!.issues.map(i => String(i.path[0])))
}

interface ParityScenario {
  description: string
  input: Partial<SchemaInput>
  expectValid: boolean
  expectedErrorFields?: string[]
}

const VALID_SCENARIOS: ParityScenario[] = [
  {
    description: 'Nonexempt hourly at $50',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: 50 },
    expectValid: true,
  },
  {
    description: 'Nonexempt yearly at $60,000',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.YEAR, rate: 60000 },
    expectValid: true,
  },
  {
    description: 'Nonexempt weekly at $1,000',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.WEEK, rate: 1000 },
    expectValid: true,
  },
  {
    description: 'Nonexempt monthly at $5,000',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.MONTH, rate: 5000 },
    expectValid: true,
  },
  {
    description: 'Nonexempt at exact minimum rate ($1)',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: 1 },
    expectValid: true,
  },
  {
    description: 'Exempt yearly at $100,000 (above FLSA threshold)',
    input: { flsaStatus: FlsaStatus.EXEMPT, paymentUnit: PAY_PERIODS.YEAR, rate: 100000 },
    expectValid: true,
  },
  {
    description: 'Exempt monthly at $5,000 (above FLSA threshold annualized)',
    input: { flsaStatus: FlsaStatus.EXEMPT, paymentUnit: PAY_PERIODS.MONTH, rate: 5000 },
    expectValid: true,
  },
  {
    description: 'Salaried nonexempt yearly at $40,000',
    input: {
      flsaStatus: FlsaStatus.SALARIED_NONEXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 40000,
    },
    expectValid: true,
  },
  {
    description: 'Salaried nonexempt hourly at $25',
    input: { flsaStatus: FlsaStatus.SALARIED_NONEXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: 25 },
    expectValid: true,
  },
  {
    description: 'Owner per-paycheck at $5,000',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.PAYCHECK, rate: 5000 },
    expectValid: true,
  },
  {
    description: 'Owner per-paycheck at exact minimum ($1)',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.PAYCHECK, rate: 1 },
    expectValid: true,
  },
  {
    description: 'Commission only exempt yearly at $0',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_EXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 0,
    },
    expectValid: true,
  },
  {
    description: 'Commission only nonexempt yearly at $0',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 0,
    },
    expectValid: true,
  },
  {
    description: 'Minimum wage enabled with a wage ID',
    input: { adjustForMinimumWage: true, minimumWageId: 'min-wage-id-1' },
    expectValid: true,
  },
  {
    description: 'Workers comp covered with a class code',
    input: { stateWcCovered: true, stateWcClassCode: 'wc-class-123' },
    expectValid: true,
  },
  {
    description: 'Minimum wage disabled with empty wage ID',
    input: { adjustForMinimumWage: false, minimumWageId: '' },
    expectValid: true,
  },
  {
    description: 'Workers comp not covered with empty class code',
    input: { stateWcCovered: false, stateWcClassCode: '' },
    expectValid: true,
  },
]

const INVALID_SCENARIOS: ParityScenario[] = [
  // --- Rate validation ---
  {
    description: 'Nonexempt with rate $0 (below minimum)',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: 0 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Nonexempt with rate $0.50 (below $1 minimum)',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: 0.5 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Nonexempt with negative rate',
    input: { flsaStatus: FlsaStatus.NONEXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: -10 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Salaried nonexempt with rate $0',
    input: { flsaStatus: FlsaStatus.SALARIED_NONEXEMPT, paymentUnit: PAY_PERIODS.YEAR, rate: 0 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },

  // --- Exempt threshold ---
  {
    description: 'Exempt yearly at $30,000 (below FLSA threshold)',
    input: { flsaStatus: FlsaStatus.EXEMPT, paymentUnit: PAY_PERIODS.YEAR, rate: 30000 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Exempt hourly at $10 (annualizes below FLSA threshold)',
    input: { flsaStatus: FlsaStatus.EXEMPT, paymentUnit: PAY_PERIODS.HOUR, rate: 10 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Exempt monthly at $2,000 (annualizes below FLSA threshold)',
    input: { flsaStatus: FlsaStatus.EXEMPT, paymentUnit: PAY_PERIODS.MONTH, rate: 2000 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Exempt at exact FLSA boundary minus $1 (yearly $35,567)',
    input: { flsaStatus: FlsaStatus.EXEMPT, paymentUnit: PAY_PERIODS.YEAR, rate: 35567 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },

  // --- Owner payment unit ---
  {
    description: 'Owner paid hourly (must be Paycheck)',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.HOUR, rate: 5000 },
    expectValid: false,
    expectedErrorFields: ['paymentUnit'],
  },
  {
    description: 'Owner paid yearly (must be Paycheck)',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.YEAR, rate: 50000 },
    expectValid: false,
    expectedErrorFields: ['paymentUnit'],
  },
  {
    description: 'Owner paid monthly (must be Paycheck)',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.MONTH, rate: 5000 },
    expectValid: false,
    expectedErrorFields: ['paymentUnit'],
  },
  {
    description: 'Owner with rate $0 (rate minimum)',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.PAYCHECK, rate: 0 },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Owner wrong payment unit AND rate $0 (both fields invalid)',
    input: { flsaStatus: FlsaStatus.OWNER, paymentUnit: PAY_PERIODS.HOUR, rate: 0 },
    expectValid: false,
    expectedErrorFields: ['paymentUnit', 'rate'],
  },

  // --- Commission-only payment unit ---
  {
    description: 'Commission only exempt paid hourly (must be Year)',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_EXEMPT,
      paymentUnit: PAY_PERIODS.HOUR,
      rate: 0,
    },
    expectValid: false,
    expectedErrorFields: ['paymentUnit'],
  },
  {
    description: 'Commission only nonexempt paid monthly (must be Year)',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
      paymentUnit: PAY_PERIODS.MONTH,
      rate: 0,
    },
    expectValid: false,
    expectedErrorFields: ['paymentUnit'],
  },
  {
    description: 'Commission only exempt with non-zero rate',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_EXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 100,
    },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Commission only nonexempt with non-zero rate',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 50,
    },
    expectValid: false,
    expectedErrorFields: ['rate'],
  },
  {
    description: 'Commission only wrong payment unit AND non-zero rate',
    input: {
      flsaStatus: FlsaStatus.COMMISSION_ONLY_EXEMPT,
      paymentUnit: PAY_PERIODS.HOUR,
      rate: 100,
    },
    expectValid: false,
    expectedErrorFields: ['paymentUnit', 'rate'],
  },

  // --- Minimum wage ---
  {
    description: 'Minimum wage enabled without wage ID',
    input: { adjustForMinimumWage: true, minimumWageId: '' },
    expectValid: false,
    expectedErrorFields: ['minimumWageId'],
  },
  {
    description: 'Minimum wage enabled with whitespace-only wage ID',
    input: { adjustForMinimumWage: true, minimumWageId: '   ' },
    expectValid: false,
    expectedErrorFields: ['minimumWageId'],
  },

  // --- Workers comp ---
  {
    description: 'Workers comp covered without class code',
    input: { stateWcCovered: true, stateWcClassCode: '' },
    expectValid: false,
    expectedErrorFields: ['stateWcClassCode'],
  },
  {
    description: 'Workers comp covered with whitespace-only class code',
    input: { stateWcCovered: true, stateWcClassCode: '   ' },
    expectValid: false,
    expectedErrorFields: ['stateWcClassCode'],
  },
]

describe('Compensation schema parity', () => {
  describe('valid inputs accepted by both schemas', () => {
    it.each(VALID_SCENARIOS)('$description', ({ input }) => {
      const fullInput = { ...BASE_VALID_INPUT, ...input }
      const employeeResult = EmployeeSchema.safeParse(fullInput)
      const hookResult = HookSchema.safeParse(fullInput)

      expect(employeeResult.success).toBe(true)
      expect(hookResult.success).toBe(true)
    })
  })

  describe('invalid inputs rejected by both schemas', () => {
    it.each(INVALID_SCENARIOS)('$description', ({ input, expectedErrorFields }) => {
      const fullInput = { ...BASE_VALID_INPUT, ...input }
      const employeeResult = EmployeeSchema.safeParse(fullInput)
      const hookResult = HookSchema.safeParse(fullInput)

      expect(employeeResult.success).toBe(false)
      expect(hookResult.success).toBe(false)

      if (expectedErrorFields) {
        const employeeErrorFields = getErrorFields(employeeResult)
        const hookErrorFields = getErrorFields(hookResult)

        for (const field of expectedErrorFields) {
          expect(employeeErrorFields).toContain(field)
          expect(hookErrorFields).toContain(field)
        }
      }
    })
  })

  describe('FLSA exempt boundary precision', () => {
    it('rejects rate just below the FLSA threshold ($35,567 yearly)', () => {
      const input = {
        ...BASE_VALID_INPUT,
        flsaStatus: FlsaStatus.EXEMPT,
        paymentUnit: PAY_PERIODS.YEAR,
        rate: 35567,
      }
      expect(EmployeeSchema.safeParse(input).success).toBe(false)
      expect(HookSchema.safeParse(input).success).toBe(false)
    })

    it('accepts rate at the FLSA threshold ($35,568 yearly)', () => {
      const input = {
        ...BASE_VALID_INPUT,
        flsaStatus: FlsaStatus.EXEMPT,
        paymentUnit: PAY_PERIODS.YEAR,
        rate: 35568,
      }
      expect(EmployeeSchema.safeParse(input).success).toBe(true)
      expect(HookSchema.safeParse(input).success).toBe(true)
    })

    it('accepts rate above the FLSA threshold ($35,569 yearly)', () => {
      const input = {
        ...BASE_VALID_INPUT,
        flsaStatus: FlsaStatus.EXEMPT,
        paymentUnit: PAY_PERIODS.YEAR,
        rate: 35569,
      }
      expect(EmployeeSchema.safeParse(input).success).toBe(true)
      expect(HookSchema.safeParse(input).success).toBe(true)
    })

    it('exempt threshold does not apply to Salaried Nonexempt', () => {
      const input = {
        ...BASE_VALID_INPUT,
        flsaStatus: FlsaStatus.SALARIED_NONEXEMPT,
        paymentUnit: PAY_PERIODS.YEAR,
        rate: 20000,
      }
      expect(EmployeeSchema.safeParse(input).success).toBe(true)
      expect(HookSchema.safeParse(input).success).toBe(true)
    })

    it('exempt threshold does not apply to Nonexempt', () => {
      const input = {
        ...BASE_VALID_INPUT,
        flsaStatus: FlsaStatus.NONEXEMPT,
        paymentUnit: PAY_PERIODS.YEAR,
        rate: 20000,
      }
      expect(EmployeeSchema.safeParse(input).success).toBe(true)
      expect(HookSchema.safeParse(input).success).toBe(true)
    })
  })

  describe('cross-field combinations', () => {
    it('validates minimum wage independently from rate', () => {
      const input = {
        ...BASE_VALID_INPUT,
        adjustForMinimumWage: true,
        minimumWageId: '',
        rate: 0,
      }
      const employeeErrors = getErrorFields(EmployeeSchema.safeParse(input))
      const hookErrors = getErrorFields(HookSchema.safeParse(input))

      expect(employeeErrors).toContain('minimumWageId')
      expect(employeeErrors).toContain('rate')
      expect(hookErrors).toContain('minimumWageId')
      expect(hookErrors).toContain('rate')
    })

    it('validates workers comp independently from rate', () => {
      const input = {
        ...BASE_VALID_INPUT,
        stateWcCovered: true,
        stateWcClassCode: '',
        rate: 0,
      }
      const employeeErrors = getErrorFields(EmployeeSchema.safeParse(input))
      const hookErrors = getErrorFields(HookSchema.safeParse(input))

      expect(employeeErrors).toContain('stateWcClassCode')
      expect(employeeErrors).toContain('rate')
      expect(hookErrors).toContain('stateWcClassCode')
      expect(hookErrors).toContain('rate')
    })

    it('validates minimum wage and workers comp together', () => {
      const input = {
        ...BASE_VALID_INPUT,
        adjustForMinimumWage: true,
        minimumWageId: '',
        stateWcCovered: true,
        stateWcClassCode: '',
      }
      const employeeErrors = getErrorFields(EmployeeSchema.safeParse(input))
      const hookErrors = getErrorFields(HookSchema.safeParse(input))

      expect(employeeErrors).toContain('minimumWageId')
      expect(employeeErrors).toContain('stateWcClassCode')
      expect(hookErrors).toContain('minimumWageId')
      expect(hookErrors).toContain('stateWcClassCode')
    })
  })
})

describe('Compensation schema known divergences', () => {
  /**
   * The Employee schema checks exempt threshold BEFORE rate minimum (and both
   * can fire for rate=0). The Hook schema checks rate minimum FIRST and uses
   * an else-if, so exempt threshold never fires when rate < 1.
   *
   * Both reject the input — the difference is which error codes surface.
   * When the schemas are unified this divergence should be resolved.
   */
  describe('Exempt with rate=0: error ordering', () => {
    const input = {
      ...BASE_VALID_INPUT,
      flsaStatus: FlsaStatus.EXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 0,
    }

    it('both schemas reject the input', () => {
      expect(EmployeeSchema.safeParse(input).success).toBe(false)
      expect(HookSchema.safeParse(input).success).toBe(false)
    })

    it('Employee schema surfaces both exempt threshold and rate minimum errors', () => {
      const result = EmployeeSchema.safeParse(input)
      const rateErrors = getErrorMessages(result, 'rate')
      expect(rateErrors).toHaveLength(2)
    })

    it('Hook schema surfaces only rate minimum (short-circuits before threshold)', () => {
      const result = HookSchema.safeParse(input)
      const rateErrors = getErrorMessages(result, 'rate')
      expect(rateErrors).toHaveLength(1)
    })
  })

  /**
   * For commission-only with non-zero rate, the Employee schema uses its
   * generic `rateMinimumError` code while the Hook schema uses a distinct
   * `RATE_COMMISSION_ZERO` code. Both reject — the error code differs.
   */
  describe('Commission-only rate error codes differ', () => {
    const input = {
      ...BASE_VALID_INPUT,
      flsaStatus: FlsaStatus.COMMISSION_ONLY_EXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 100,
    }

    it('both schemas reject commission-only with non-zero rate', () => {
      expect(EmployeeSchema.safeParse(input).success).toBe(false)
      expect(HookSchema.safeParse(input).success).toBe(false)
    })

    it('both schemas error on the rate field', () => {
      const employeeErrors = getErrorFields(EmployeeSchema.safeParse(input))
      const hookErrors = getErrorFields(HookSchema.safeParse(input))
      expect(employeeErrors).toContain('rate')
      expect(hookErrors).toContain('rate')
    })
  })
})

function getErrorMessages(
  result: {
    success: boolean
    error?: { issues: { path: PropertyKey[]; message: string }[] }
  },
  field: string,
) {
  if (result.success) return []
  return result.error!.issues.filter(i => String(i.path[0]) === field).map(i => i.message)
}
