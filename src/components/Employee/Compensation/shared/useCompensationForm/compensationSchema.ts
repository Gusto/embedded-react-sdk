import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceToISODate } from '@/partner-hook-utils/form/preprocessors'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus, PAY_PERIODS } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

/**
 * Validation error codes emitted by the `useCompensationForm` schema. Map these
 * to localized error text via the `validationMessages` prop on each field.
 *
 * @public
 */
export const CompensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
  PAYMENT_UNIT_OWNER: 'PAYMENT_UNIT_OWNER',
  PAYMENT_UNIT_COMMISSION: 'PAYMENT_UNIT_COMMISSION',
  RATE_COMMISSION_ZERO: 'RATE_COMMISSION_ZERO',
  EFFECTIVE_DATE_BEFORE_HIRE: 'EFFECTIVE_DATE_BEFORE_HIRE',
  EFFECTIVE_DATE_BEFORE_MIN: 'EFFECTIVE_DATE_BEFORE_MIN',
} as const

/**
 * Union of validation error code values emitted by `useCompensationForm` fields.
 *
 * @public
 */
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
  // `flsaStatus` is `.optional()` so the field can render an empty placeholder
  // until the user (or partner default) picks one. Requiredness is still
  // enforced via `requiredFieldsConfig` on submit in `create` mode.
  flsaStatus: z
    .enum([
      FlsaStatus.EXEMPT,
      FlsaStatus.SALARIED_NONEXEMPT,
      FlsaStatus.NONEXEMPT,
      FlsaStatus.OWNER,
      FlsaStatus.COMMISSION_ONLY_EXEMPT,
      FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
    ])
    .optional(),
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
   *   (rate change). Must be on or after `hireDate`. Server-side this maps to
   *   POST /v1/jobs/:jobId/compensations.
   * - **update mode (`compensationId` present)**: optional; if omitted the API
   *   keeps the existing effective date. The `hireDate` lower bound is **not**
   *   enforced — loaded values may legitimately predate the hire date. Maps to
   *   PUT /v1/compensations/:id.
   */
  effectiveDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  adjustForMinimumWage: z.boolean(),
  minimumWageId: z.string(),
}

/**
 * Shape of the compensation form values: title, FLSA status, rate, payment unit,
 * effective date, and the minimum-wage adjustment toggle and selection. Use as
 * the `defaultValues` shape passed into `useCompensationForm`.
 *
 * @public
 */
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
    // Surface the EXEMPT salary-threshold issue *before* the generic minimum,
    // so a partner setting rate=0 with EXEMPT sees the more actionable
    // "must meet salary threshold" message rather than the generic
    // "amount must be at least $1.00".
    if (
      flsaStatus === FlsaStatus.EXEMPT &&
      yearlyRate(rate, paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_EXEMPT_THRESHOLD,
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
    if (rate < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate'],
        message: CompensationErrorCodes.RATE_MINIMUM,
      })
    }
  } else if (
    flsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT ||
    flsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT
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

/**
 * Override map for fields that are optional in a given mode but should be
 * required on submit. `title` is optional in both modes; `flsaStatus`,
 * `paymentUnit`, `rate`, and `effectiveDate` are optional on update.
 *
 * @public
 */
export type CompensationOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/**
 * Shape of the values produced by `useCompensationForm.form.getFormSubmissionValues()`
 * after schema validation. Identical to {@link CompensationFormData}.
 *
 * @public
 */
export type CompensationFormOutputs = CompensationFormData

/**
 * Options accepted by {@link createCompensationSchema}.
 *
 * @public
 */
export interface CompensationSchemaOptions {
  /** `'create'` validates create-mode requireds (`POST /v1/jobs/:jobId/compensations`). `'update'` relaxes them for `PUT /v1/compensations/:id`. Defaults to `'create'`. */
  mode?: 'create' | 'update'
  /** Promote fields that are optional in the chosen `mode` to required on submit. */
  optionalFieldsToRequire?: CompensationOptionalFieldsToRequire
  /**
   * Lower bound for `effectiveDate` (typically the parent job's `hireDate`).
   * Only enforced in `create` mode — on `update` the loaded effective date
   * may legitimately predate the hire date and is left as-is. Surfaces an
   * `EFFECTIVE_DATE_BEFORE_HIRE` issue when violated.
   */
  hireDate?: string | null
  /**
   * Absolute lower bound for `effectiveDate`, enforced in both create and
   * update modes whenever provided. Typically `addDays(today, 1)` (tomorrow)
   * for management screens where effective dates must be in the future, or
   * `max(tomorrow, hireDate)` for secondary new jobs. Surfaces an
   * `EFFECTIVE_DATE_BEFORE_MIN` issue when violated.
   *
   * **Callers must only pass this when the carve-out cannot fire.** The
   * carve-out (`willDeleteSecondaryJobs` in update mode) forces `effectiveDate`
   * to today on a disabled field — passing `minEffectiveDate` for a primary
   * job in update mode would cause a spurious validation failure on submit.
   * Secondary jobs are safe because their FLSA field is hidden, preventing the
   * carve-out from activating.
   */
  minEffectiveDate?: string | null
  /**
   * When `false`, drops `effectiveDate` from the validated shape — the field
   * becomes hook-managed (e.g. seeded from the parent job's `hireDate` during
   * onboarding). Partners may still supply the value at submit time via
   * `CompensationSubmitOptions.effectiveDate`. Defaults to `true`.
   */
  withEffectiveDateField?: boolean
}

/**
 * Builds the Zod schema and field-metadata config that back `useCompensationForm`.
 *
 * @param options - Schema configuration: `mode`, `optionalFieldsToRequire`,
 *   `hireDate`, `minEffectiveDate`, and `withEffectiveDateField`.
 * @returns A tuple of the Zod schema and the derived field metadata config for
 *   driving `useCompensationForm`'s `fieldsMetadata`.
 * @public
 */
export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const {
    mode = 'create',
    optionalFieldsToRequire,
    hireDate,
    minEffectiveDate,
    withEffectiveDateField = true,
  } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: CompensationErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withEffectiveDateField ? [] : ['effectiveDate'],
    superRefine: (data, ctx) => {
      validateFlsaRules(data, ctx)
      // Enforce the hire-date lower bound in create mode always, and in
      // update mode when `minEffectiveDate` is also set (management screens
      // where the user is actively picking a new date). On plain update
      // without `minEffectiveDate`, the loaded effectiveDate can legitimately
      // predate the hire date (stub or out-of-order data) and the API
      // accepts the unchanged value — blocking the submit would trap
      // partners whose flow doesn't render Fields.EffectiveDate.
      // When `withEffectiveDateField` is false the field is excluded from
      // the shape and `data.effectiveDate` is undefined — this check
      // naturally short-circuits.
      if (
        hireDate &&
        data.effectiveDate &&
        data.effectiveDate < hireDate &&
        (mode === 'create' || minEffectiveDate)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effectiveDate'],
          message: CompensationErrorCodes.EFFECTIVE_DATE_BEFORE_HIRE,
        })
      }
      // Enforce the caller-supplied minimum effective date in both modes.
      // Callers must only pass this when the carve-out cannot fire (see
      // CompensationSchemaOptions.minEffectiveDate for details).
      if (minEffectiveDate && data.effectiveDate && data.effectiveDate < minEffectiveDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effectiveDate'],
          message: CompensationErrorCodes.EFFECTIVE_DATE_BEFORE_MIN,
        })
      }
    },
  })
}
