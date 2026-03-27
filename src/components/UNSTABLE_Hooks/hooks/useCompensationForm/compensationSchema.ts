import { z } from 'zod'
import {
  createDomainSchema,
  type DomainSchemaConfig,
  type BusinessConstraint,
} from '../../form/createDomainSchema'
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

// Layer 1: Field definitions (pure types)
const fieldDefinitions = {
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
  rate: z.number(),
  startDate: z.iso.date().nullable(),
  adjustForMinimumWage: z.boolean(),
  minimumWageId: z.string(),
  stateWcCovered: z.boolean().optional(),
  stateWcClassCode: z.string(),
  twoPercentShareholder: z.boolean().optional(),
}

export type CompensationField = Exclude<
  keyof typeof fieldDefinitions,
  | 'adjustForMinimumWage'
  | 'minimumWageId'
  | 'stateWcCovered'
  | 'stateWcClassCode'
  | 'twoPercentShareholder'
>

export type CompensationFormData = {
  [K in keyof typeof fieldDefinitions]: z.infer<(typeof fieldDefinitions)[K]>
}
export type CompensationFormOutputs = CompensationFormData

// Layer 5: Business constraints
function validateRateAndPaymentUnit(
  data: CompensationFormData,
  ctx: z.RefinementCtx,
) {
  const { flsaStatus, paymentUnit, rate } = data

  const isStandardFlsa =
    flsaStatus === FlsaStatus.EXEMPT ||
    flsaStatus === FlsaStatus.SALARIED_NONEXEMPT ||
    flsaStatus === FlsaStatus.NONEXEMPT

  if (isStandardFlsa) {
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
    return
  }

  if (flsaStatus === FlsaStatus.OWNER) {
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
    return
  }

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

// Schema factory
interface CompensationSchemaOptions {
  mode?: 'create' | 'update'
  requiredFields?: RequiredFields<CompensationField>
  withStartDateField?: boolean
}

export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const { mode = 'create', requiredFields, withStartDateField = true } = options

  const effectiveRequiredFields = withStartDateField
    ? requiredFields
    : filterRequiredFields(requiredFields, 'startDate')

  const apiRequiredOnCreate: CompensationField[] = ['jobTitle', 'flsaStatus', 'rate', 'paymentUnit']
  if (withStartDateField) {
    apiRequiredOnCreate.push('startDate')
  }

  const config: DomainSchemaConfig<typeof fieldDefinitions> = {
    fieldDefinitions,

    // Layer 2: Required fields configuration
    requiredFieldsConfig: {
      requiredMessageCode: CompensationErrorCodes.REQUIRED,
      partnerConfigurableFields: ['jobTitle', 'flsaStatus', 'rate', 'paymentUnit', 'startDate'],
      apiRequired: {
        create: apiRequiredOnCreate,
        update: [],
      },
    },

    // Layer 3: Field transforms
    fieldTransforms: {
      rate: val => {
        if (val === undefined || val === null || Number.isNaN(val)) return 0
        return val
      },
      startDate: val => {
        if (val instanceof Date) return val.toISOString().split('T')[0]
        if (val === null || val === '' || val === undefined) return null
        return val
      },
      stateWcCovered: val => (typeof val === 'string' ? val === 'true' : val),
    },

    // Layer 4: Conditional requirements
    conditionalRequirements: [
      {
        when: { field: 'adjustForMinimumWage', is: true },
        then: { require: 'minimumWageId', message: CompensationErrorCodes.REQUIRED },
      },
      {
        when: data => data.stateWcCovered === true,
        then: { require: 'stateWcClassCode', message: CompensationErrorCodes.REQUIRED },
      },
    ],

    // Layer 5: Business constraints
    businessConstraints: [
      validateRateAndPaymentUnit as BusinessConstraint<CompensationFormData>,
    ],
  }

  return createDomainSchema(config, { mode, requiredFields: effectiveRequiredFields })
}

export const CompensationSchema = createCompensationSchema().schema
