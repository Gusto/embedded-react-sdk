import { z } from 'zod'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus, PAY_PERIODS } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const CompensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
  PAYMENT_UNIT_OWNER: 'PAYMENT_UNIT_OWNER',
  PAYMENT_UNIT_COMMISSION: 'PAYMENT_UNIT_COMMISSION',
  RATE_COMMISSION_ZERO: 'RATE_COMMISSION_ZERO',
} as const

export type CompensationErrorCode =
  (typeof CompensationErrorCodes)[keyof typeof CompensationErrorCodes]

export const CompensationObjectSchema = z.object({
  jobTitle: z.string().min(1, { message: CompensationErrorCodes.REQUIRED }),
  adjustForMinimumWage: z.boolean(),
  minimumWageId: z.string().optional(),
  stateWcCovered: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
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
  paymentUnit: z.enum([
    PAY_PERIODS.HOUR,
    PAY_PERIODS.WEEK,
    PAY_PERIODS.MONTH,
    PAY_PERIODS.YEAR,
    PAY_PERIODS.PAYCHECK,
  ]),
  rate: z.number().or(z.nan()).optional(),
  startDate: z.date().nullable().optional(),
})

function compensationSuperRefine(
  requireStartDate: boolean,
  data: z.input<typeof CompensationObjectSchema>,
  ctx: z.RefinementCtx,
) {
  if (requireStartDate && !data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startDate'],
      message: CompensationErrorCodes.REQUIRED,
    })
  }

  if (data.adjustForMinimumWage && (!data.minimumWageId || data.minimumWageId.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['minimumWageId'],
      message: CompensationErrorCodes.REQUIRED,
    })
  }

  if (
    data.stateWcCovered === true &&
    (!data.stateWcClassCode || data.stateWcClassCode.trim() === '')
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['stateWcClassCode'],
      message: CompensationErrorCodes.REQUIRED,
    })
  }

  const { flsaStatus, paymentUnit } = data
  const rate = Number.isNaN(data.rate) ? undefined : data.rate

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
        message: CompensationErrorCodes.RATE_EXEMPT_THRESHOLD,
      })
    }

    if (rate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.REQUIRED,
      })
    } else if (rate < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_MINIMUM,
      })
    }
  } else if (flsaStatus === FlsaStatus.OWNER) {
    if (paymentUnit !== PAY_PERIODS.PAYCHECK) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paymentUnit'],
        message: CompensationErrorCodes.PAYMENT_UNIT_OWNER,
      })
    }
    if (rate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.REQUIRED,
      })
    } else if (rate < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_MINIMUM,
      })
    }
  } else if (
    [FlsaStatus.COMMISSION_ONLY_EXEMPT, FlsaStatus.COMMISSION_ONLY_NONEXEMPT].includes(flsaStatus)
  ) {
    if (paymentUnit !== PAY_PERIODS.YEAR) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['paymentUnit'],
        message: CompensationErrorCodes.PAYMENT_UNIT_COMMISSION,
      })
    }
    if (rate !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_COMMISSION_ZERO,
      })
    }
  }
}

export function createCompensationSchema({ requireStartDate = false } = {}) {
  return CompensationObjectSchema.superRefine((data, ctx) => {
    compensationSuperRefine(requireStartDate, data, ctx)
  })
}

export const CompensationSchema = createCompensationSchema()

export type CompensationFormData = z.input<typeof CompensationSchema>
export type CompensationFormOutputs = z.output<typeof CompensationSchema>
