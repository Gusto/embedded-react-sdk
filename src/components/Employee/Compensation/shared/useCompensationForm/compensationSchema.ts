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
 * Validation error codes produced by the {@link useCompensationForm} schema.
 *
 * @remarks
 * Use these constants as the keys in a field's `validationMessages` prop to
 * map an error code to a user-facing message.
 *
 * | Code | When it triggers |
 * | ---- | ---------------- |
 * | `REQUIRED` | A required field is empty (per mode and `optionalFieldsToRequire`). |
 * | `RATE_MINIMUM` | `rate` is less than `$1.00` for non-commission FLSA statuses. |
 * | `RATE_EXEMPT_THRESHOLD` | FLSA `Exempt` employees must clear the federal salary threshold (annualized). |
 * | `PAYMENT_UNIT_OWNER` | `Owner` FLSA status requires `paymentUnit === 'Paycheck'`. |
 * | `PAYMENT_UNIT_COMMISSION` | Commission-only FLSA statuses require `paymentUnit === 'Year'`. |
 * | `RATE_COMMISSION_ZERO` | Commission-only FLSA statuses require `rate === 0`. |
 * | `EFFECTIVE_DATE_BEFORE_HIRE` | `effectiveDate` precedes the parent job's `hireDate`. |
 * | `EFFECTIVE_DATE_BEFORE_MIN` | `effectiveDate` precedes the caller-supplied minimum (typically tomorrow). |
 *
 * @public
 *
 * @example
 * ```tsx
 * import { CompensationErrorCodes } from '@gusto/embedded-react-sdk'
 *
 * <Fields.Rate
 *   label="Compensation amount"
 *   validationMessages={{
 *     [CompensationErrorCodes.REQUIRED]: 'Amount is required',
 *     [CompensationErrorCodes.RATE_MINIMUM]: 'Amount must be at least $1.00',
 *     [CompensationErrorCodes.RATE_EXEMPT_THRESHOLD]: 'Exempt employees must meet the salary threshold',
 *   }}
 * />
 * ```
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
 * Union of every error code produced by the {@link useCompensationForm} schema.
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
 * Shape of the form values managed by {@link useCompensationForm}.
 *
 * @remarks
 * Accepted as `defaultValues` on `useCompensationForm` and returned by
 * `form.getFormSubmissionValues()` once the form has validated. `effectiveDate`
 * is an ISO date string (`YYYY-MM-DD`) or `null`; `flsaStatus` is optional so
 * the field can render an empty placeholder when nothing is preselected
 * (requiredness is enforced on submit per mode).
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
 * Override which fields are required on a given submission mode of {@link useCompensationForm}.
 *
 * @remarks
 * Each mode key lists the fields that are optional by default for that mode
 * but should be promoted to required. `adjustForMinimumWage` is always
 * required and `minimumWageId` is automatically required when
 * `adjustForMinimumWage` is `true` — neither is configurable here.
 *
 * | Field | Required on create | Required on update | Configurable? |
 * | ----- | ------------------ | ------------------ | ------------- |
 * | `flsaStatus` | Yes | No | Yes (on update) |
 * | `paymentUnit` | Yes | No | Yes (on update) |
 * | `rate` | Yes | No | Yes (on update) |
 * | `effectiveDate` | Yes | No | Yes (on update) |
 * | `title` | No | No | Yes (either mode) |
 * | `adjustForMinimumWage` | Yes | Yes | No |
 * | `minimumWageId` | When toggle is on | When toggle is on | No |
 *
 * @public
 *
 * @example
 * ```tsx
 * const compensation = useCompensationForm({
 *   employeeId,
 *   jobId,
 *   compensationId,
 *   optionalFieldsToRequire: {
 *     update: ['title', 'rate'],
 *   },
 * })
 * ```
 */
export type CompensationOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/**
 * Validated submission shape produced by the {@link useCompensationForm} schema.
 *
 * @remarks
 * Identical to {@link CompensationFormData} — exposed as a separate alias so
 * the input vs. output sides of the schema remain distinguishable in advanced
 * usages.
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
  /** Selects required-field rules: `'create'` (POST) or `'update'` (PUT). Defaults to `'create'`. */
  mode?: 'create' | 'update'
  /** Promote default-optional fields to required for the selected mode. See {@link CompensationOptionalFieldsToRequire}. */
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
 * Builds the Zod schema and field-metadata config used internally by {@link useCompensationForm}.
 *
 * @remarks
 * Exposed for advanced cases where the schema is needed outside the hook (for
 * example, to validate a payload before composing with another form). Most
 * usages do not need to call this directly — {@link useCompensationForm}
 * constructs the schema on every render based on its props.
 *
 * @param options - Schema configuration. See {@link CompensationSchemaOptions}.
 * @returns A tuple of `[schema, metadataConfig]` produced by `buildFormSchema`.
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
