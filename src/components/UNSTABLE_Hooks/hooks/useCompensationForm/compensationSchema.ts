import { z } from 'zod'
import { composeFormSchema } from '../../form/composeFormSchema'
import { filterRequiredFields, type RequiredFields } from '../../form/resolveRequiredFields'
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

const fieldValidators = {
  jobTitle: z.string().min(1, { message: CompensationErrorCodes.REQUIRED }),
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
  rate: z.number().optional(),
  startDate: z.iso.date().nullable().optional(),
  adjustForMinimumWage: z.boolean(),
  minimumWageId: z.string().optional(),
  stateWcCovered: z.boolean().optional(),
  stateWcClassCode: z.string().optional(),
  twoPercentShareholder: z.boolean().optional(),
}

const FIXED_FIELDS = new Set([
  'adjustForMinimumWage',
  'minimumWageId',
  'stateWcCovered',
  'stateWcClassCode',
  'twoPercentShareholder',
])

export type CompensationField = Exclude<
  keyof typeof fieldValidators,
  | 'adjustForMinimumWage'
  | 'minimumWageId'
  | 'stateWcCovered'
  | 'stateWcClassCode'
  | 'twoPercentShareholder'
>

export type CompensationFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type CompensationFormOutputs = CompensationFormData

const runtimeFieldValidators = {
  ...fieldValidators,
  rate: z.preprocess(val => (Number.isNaN(val) ? undefined : val), z.number().optional()),
  startDate: z.preprocess(
    val => (val instanceof Date ? val.toISOString().split('T')[0] : val),
    z.iso.date().nullable().optional(),
  ),
  stateWcCovered: z
    .preprocess(val => (typeof val === 'string' ? val === 'true' : val), z.boolean())
    .optional(),
}

const REQUIRED_ON_CREATE = new Set<CompensationField>([
  'jobTitle',
  'flsaStatus',
  'rate',
  'paymentUnit',
])
const REQUIRED_ON_UPDATE = new Set<CompensationField>([])

interface CompensationSchemaOptions {
  mode?: 'create' | 'update'
  requiredFields?: RequiredFields<CompensationField>
  withStartDateField?: boolean
}

function compensationSuperRefine(data: CompensationFormData, ctx: z.RefinementCtx) {
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

export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const { mode = 'create', requiredFields, withStartDateField = true } = options

  const effectiveRequiredFields = withStartDateField
    ? requiredFields
    : filterRequiredFields(requiredFields, 'startDate')

  const effectiveRequiredOnCreate = new Set(REQUIRED_ON_CREATE)
  if (withStartDateField) {
    effectiveRequiredOnCreate.add('startDate')
  }

  const baseSchema = composeFormSchema({
    fieldValidators: runtimeFieldValidators,
    fixedFields: FIXED_FIELDS,
    requiredOnCreate: effectiveRequiredOnCreate,
    requiredOnUpdate: REQUIRED_ON_UPDATE,
    mode,
    requiredFields: effectiveRequiredFields,
  })

  return baseSchema.superRefine((data, ctx) => {
    compensationSuperRefine(data as CompensationFormData, ctx)
  })
}

export const CompensationSchema = createCompensationSchema()
