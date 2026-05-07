import { z } from 'zod'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const rateMinimumError = 'rate_minimum_error'
export const rateExemptThresholdError = 'rate_exempt_threshold_error'

export const CompensationSchema = z
  .object({
    jobTitle: z.string().min(1),
    adjustForMinimumWage: z.boolean(),
    minimumWageId: z.string().optional(),
    stateWcCovered: z.boolean().optional(),
    stateWcClassCode: z.string().optional(),
    twoPercentShareholder: z.boolean().optional(),
    flsaStatus: z.enum([
      FlsaStatus.EXEMPT,
      FlsaStatus.SALARIED_NONEXEMPT,
      FlsaStatus.NONEXEMPT,
      FlsaStatus.OWNER,
      FlsaStatus.COMMISSION_ONLY_EXEMPT,
      FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
    ]),
    paymentUnit: z.enum(['Hour', 'Week', 'Month', 'Year', 'Paycheck']),
    rate: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.adjustForMinimumWage && (!data.minimumWageId || data.minimumWageId.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minimumWageId'],
        message: 'minimumWageId is required when adjustForMinimumWage is true',
      })
    }

    if (
      data.stateWcCovered === true &&
      (!data.stateWcClassCode || data.stateWcClassCode.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stateWcClassCode'],
        message: 'stateWcClassCode is required when stateWcCovered is true',
      })
    }

    const { flsaStatus, paymentUnit, rate } = data
    if (
      flsaStatus === FlsaStatus.EXEMPT ||
      flsaStatus === FlsaStatus.SALARIED_NONEXEMPT ||
      flsaStatus === FlsaStatus.NONEXEMPT
    ) {
      if (
        flsaStatus === FlsaStatus.EXEMPT &&
        rate !== undefined &&
        yearlyRate(rate, paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateExemptThresholdError,
        })
      }

      if (rate === undefined || rate < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateMinimumError,
        })
      }
    } else if (flsaStatus === FlsaStatus.OWNER) {
      if (paymentUnit !== 'Paycheck') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentUnit'],
          message: 'paymentUnit must be Paycheck for OWNER',
        })
      }
      if (rate === undefined || rate < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateMinimumError,
        })
      }
    } else if (
      [FlsaStatus.COMMISSION_ONLY_EXEMPT, FlsaStatus.COMMISSION_ONLY_NONEXEMPT].includes(flsaStatus)
    ) {
      if (paymentUnit !== 'Year') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentUnit'],
          message: 'paymentUnit must be Year for commission-only FLSA statuses',
        })
      }
      if (rate !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: rateMinimumError,
        })
      }
    }
  })

export type CompensationInputs = z.input<typeof CompensationSchema>
export type CompensationOutputs = z.output<typeof CompensationSchema>
