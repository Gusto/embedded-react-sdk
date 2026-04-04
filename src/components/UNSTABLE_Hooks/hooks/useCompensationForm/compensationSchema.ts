import { z } from 'zod'
import { field, type FieldConfig, type ConfigurableFieldName } from '../../form/field'
import { buildFormSchema } from '../../form/buildFormSchema'
import type { RequiredFields } from '../../form/resolveRequiredFields'
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

// ── Field schemas (data shape + format validation) ─────────────────────

const schemas = {
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
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  stateWcClassCode: z.string(),
  twoPercentShareholder: z.boolean(),
}

export type CompensationFormData = { [K in keyof typeof schemas]: z.infer<(typeof schemas)[K]> }

// ── Field config (requiredness, error codes) ───────────────────────────

const compensationFields: FieldConfig<typeof schemas> = {
  jobTitle: field(schemas.jobTitle, {
    required: 'create',
    errorCode: CompensationErrorCodes.REQUIRED,
  }),
  flsaStatus: field(schemas.flsaStatus, { required: 'create' }),
  paymentUnit: field(schemas.paymentUnit, { required: 'create' }),
  rate: field(schemas.rate, {
    required: 'create',
    errorCode: CompensationErrorCodes.REQUIRED,
  }),
  startDate: field(schemas.startDate, {
    required: 'create',
    errorCode: CompensationErrorCodes.REQUIRED,
  }),
  adjustForMinimumWage: field(schemas.adjustForMinimumWage),
  minimumWageId: field(schemas.minimumWageId, {
    required: (data: CompensationFormData) => data.adjustForMinimumWage,
    errorCode: CompensationErrorCodes.REQUIRED,
  }),
  stateWcCovered: field(schemas.stateWcCovered),
  stateWcClassCode: field(schemas.stateWcClassCode, {
    required: (data: CompensationFormData) => data.stateWcCovered,
    errorCode: CompensationErrorCodes.REQUIRED,
  }),
  twoPercentShareholder: field(schemas.twoPercentShareholder),
}

// ── Cross-field validation (FLSA business rules) ───────────────────────

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
  } else {
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

// ── Schema factory ─────────────────────────────────────────────────────

export type CompensationField = ConfigurableFieldName<typeof compensationFields>
export type CompensationFormOutputs = CompensationFormData

interface CompensationSchemaOptions {
  mode?: 'create' | 'update'
  requiredFields?: RequiredFields<CompensationField>
  withStartDateField?: boolean
}

export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const { mode = 'create', requiredFields, withStartDateField = true } = options

  return buildFormSchema(compensationFields, {
    mode,
    requiredFields,
    excludeFields: withStartDateField ? [] : ['startDate'],
    superRefine: validateFlsaRules,
  })
}

export const CompensationSchema = createCompensationSchema()
