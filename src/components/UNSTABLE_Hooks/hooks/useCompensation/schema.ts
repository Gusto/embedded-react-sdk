import { z } from 'zod'
import { FlsaStatus, FLSA_OVERTIME_SALARY_LIMIT } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const compensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
} as const

export type CompensationErrorCode =
  (typeof compensationErrorCodes)[keyof typeof compensationErrorCodes]

const flsaStatusValues = [
  FlsaStatus.EXEMPT,
  FlsaStatus.SALARIED_NONEXEMPT,
  FlsaStatus.NONEXEMPT,
  FlsaStatus.OWNER,
  FlsaStatus.COMMISSION_ONLY_EXEMPT,
  FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
] as const

const paymentUnitValues = ['Hour', 'Week', 'Month', 'Year', 'Paycheck'] as const

export type FlsaStatusValue = (typeof flsaStatusValues)[number]
export type PaymentUnitValue = (typeof paymentUnitValues)[number]

export const generateCompensationSchema = () =>
  z
    .object({
      jobTitle: z.string().min(1, { message: compensationErrorCodes.REQUIRED }),
      flsaStatus: z.enum(flsaStatusValues, { message: compensationErrorCodes.REQUIRED }),
      rate: z.number().optional(),
      paymentUnit: z.enum(paymentUnitValues, { message: compensationErrorCodes.REQUIRED }),
      adjustForMinimumWage: z.boolean(),
      minimumWageId: z.string().optional(),
      twoPercentShareholder: z.boolean().optional(),
      stateWcCovered: z.boolean().optional(),
      stateWcClassCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.adjustForMinimumWage && (!data.minimumWageId || data.minimumWageId.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['minimumWageId'],
          message: compensationErrorCodes.REQUIRED,
        })
      }

      if (
        data.stateWcCovered === true &&
        (!data.stateWcClassCode || data.stateWcClassCode.trim() === '')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stateWcClassCode'],
          message: compensationErrorCodes.REQUIRED,
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
          paymentUnit !== 'Paycheck' &&
          yearlyRate(rate, paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rate'],
            message: compensationErrorCodes.RATE_EXEMPT_THRESHOLD,
          })
        }

        if (rate === undefined || rate < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rate'],
            message: compensationErrorCodes.RATE_MINIMUM,
          })
        }
      } else if (flsaStatus === FlsaStatus.OWNER) {
        if (rate === undefined || rate < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rate'],
            message: compensationErrorCodes.RATE_MINIMUM,
          })
        }
      } else {
        if (rate !== 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['rate'],
            message: compensationErrorCodes.RATE_MINIMUM,
          })
        }
      }
    })

export type CompensationSchema = ReturnType<typeof generateCompensationSchema>
export type CompensationFormData = z.infer<CompensationSchema>
