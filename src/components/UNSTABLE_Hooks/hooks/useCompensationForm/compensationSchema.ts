import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '../../form/buildFormSchema'
import { coerceNaN, coerceToISODate, coerceStringBoolean } from '../../form/preprocessors'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus, PAY_PERIODS } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

// ── Error codes ────────────────────────────────────────────────────────

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

const fieldValidators = {
  jobTitle: z.string(),
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
  rate: z.preprocess(coerceNaN(0), z.number()),
  startDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  adjustForMinimumWage: z.boolean(),
  minimumWageId: z.string(),
  // Radio group delivers 'true'/'false' strings; coerceStringBoolean converts to boolean
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  stateWcClassCode: z.string(),
  twoPercentShareholder: z.boolean(),
}

export type CompensationFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

// ── Required fields config (requiredness rules per field) ────────────

const requiredFieldsConfig = {
  jobTitle: 'create',
  flsaStatus: 'create',
  paymentUnit: 'create',
  rate: 'create',
  startDate: 'create',
  minimumWageId: data => data.adjustForMinimumWage,
  stateWcClassCode: data => String(data.stateWcCovered) === 'true',
} satisfies RequiredFieldConfig<typeof fieldValidators>

function validateFlsaRules(data: CompensationFormData, ctx: z.RefinementCtx) {
  const { flsaStatus, paymentUnit, rate } = data

  if (
    flsaStatus === FlsaStatus.EXEMPT ||
    flsaStatus === FlsaStatus.SALARIED_NONEXEMPT ||
    flsaStatus === FlsaStatus.NONEXEMPT
  ) {
    if (rate < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_MINIMUM,
      })
    } else if (
      flsaStatus === FlsaStatus.EXEMPT &&
      yearlyRate(rate, paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_EXEMPT_THRESHOLD,
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
    if (rate < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_MINIMUM,
      })
    }
    /* eslint-disable @typescript-eslint/no-unnecessary-condition -- explicit match prevents a future FLSA status from silently falling into commission rules */
  } else if (
    flsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT ||
    flsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT
  ) {
    /* eslint-enable @typescript-eslint/no-unnecessary-condition */
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

// ── Schema factory ───────────────────────────────────────────────────

export type CompensationOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>
export type CompensationFormOutputs = CompensationFormData

interface CompensationSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  withStartDateField?: boolean
}

export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withStartDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: CompensationErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withStartDateField ? [] : ['startDate'],
    superRefine: validateFlsaRules,
  })
}
