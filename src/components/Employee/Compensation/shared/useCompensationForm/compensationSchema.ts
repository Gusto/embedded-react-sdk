import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceToISODate } from '@/partner-hook-utils/form/preprocessors'
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
  EFFECTIVE_DATE_BEFORE_HIRE: 'EFFECTIVE_DATE_BEFORE_HIRE',
} as const

export type CompensationErrorCode =
  (typeof CompensationErrorCodes)[keyof typeof CompensationErrorCodes]

const fieldValidators = {
  /**
   * Optional in both modes. Setting title here scopes the change to this
   * compensation's `effectiveDate` — pair it with a future-dated comp to
   * schedule a promotion title alongside a rate change. Use
   * `useJobForm.Fields.Title` instead when creating a job (title is required
   * by the API on job creation) or when renaming the active role
   * immediately, and avoid rendering both fields on the same screen.
   */
  title: z.string(),
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
  /**
   * The effective date a new compensation should take effect on.
   *
   * - **create mode (`compensationId` absent)**: required; partners typically default
   *   to the parent job's `hireDate` (onboarding stub-fill) or a future date
   *   (rate change). Server-side this maps to POST /v1/jobs/:jobId/compensations.
   * - **update mode (`compensationId` present)**: optional; if omitted the API
   *   keeps the existing effective date. PUT /v1/compensations/:id.
   */
  effectiveDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  adjustForMinimumWage: z.boolean(),
  minimumWageId: z.string(),
}

export type CompensationFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

const requiredFieldsConfig = {
  title: 'never',
  flsaStatus: 'create',
  paymentUnit: 'create',
  rate: 'create',
  effectiveDate: 'create',
  minimumWageId: data => data.adjustForMinimumWage,
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

export type CompensationOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>
export type CompensationFormOutputs = CompensationFormData

export interface CompensationSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  /**
   * Lower bound for `effectiveDate` (typically the parent job's `hireDate`).
   * When set, surfaces a `EFFECTIVE_DATE_BEFORE_HIRE` issue if the user
   * picks an earlier date.
   */
  hireDate?: string | null
}

export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, hireDate } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: CompensationErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    superRefine: (data, ctx) => {
      validateFlsaRules(data, ctx)
      if (hireDate && data.effectiveDate && data.effectiveDate < hireDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effectiveDate'],
          message: CompensationErrorCodes.EFFECTIVE_DATE_BEFORE_HIRE,
        })
      }
    },
  })
}
