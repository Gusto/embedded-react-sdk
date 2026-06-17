import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceToISODate, coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

/**
 * Validation error codes produced by the {@link useJobForm} schema.
 *
 * @remarks
 * Use these constants as the keys in a field's `validationMessages` prop to
 * map an error code to a user-facing message.
 *
 * @public
 *
 * @example
 * ```tsx
 * import { JobErrorCodes } from '@gusto/embedded-react-sdk'
 *
 * <Fields.Title
 *   label="Job title"
 *   validationMessages={{ [JobErrorCodes.REQUIRED]: 'Job title is required' }}
 * />
 * ```
 */
export const JobErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of every error code produced by the {@link useJobForm} schema.
 *
 * @public
 */
export type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes]

const fieldValidators = {
  /** The employee's job title (e.g. `"Software Engineer"`). */
  title: z.string(),
  /** The employee's hire date as an ISO 8601 string (`YYYY-MM-DD`), or `null` if unknown. */
  hireDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  /** Whether the employee owns 2 % or more of an S-corporation. Affects benefit-deduction tax treatment. */
  twoPercentShareholder: z.boolean(),
  // Radio group delivers 'true'/'false' strings; coerceStringBoolean converts to boolean.
  /** Whether the employee is covered under Washington state workers' compensation insurance. */
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  /** Washington state workers' compensation risk-class code. Required when `stateWcCovered` is `true`. */
  stateWcClassCode: z.string(),
}

/**
 * Shape of the form values managed by {@link useJobForm}.
 *
 * @remarks
 * Accepted as `defaultValues` on `useJobForm` and returned by
 * `form.getFormSubmissionValues()` once the form has validated. `hireDate` is
 * an ISO date string (`YYYY-MM-DD`) or `null`; `stateWcCovered` is a boolean
 * even though the radio group surfaces `'true'` / `'false'` strings during
 * input (the schema preprocessor coerces them).
 *
 * @public
 * @interface
 */
export type JobFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Validated submission shape produced by the {@link useJobForm} schema.
 *
 * @remarks
 * Identical to {@link JobFormData} — exposed as a separate alias so the input
 * vs. output sides of the schema remain distinguishable in advanced usages.
 *
 * @public
 */
export type JobFormOutputs = JobFormData

const requiredFieldsConfig = {
  title: 'create',
  hireDate: 'create',
  twoPercentShareholder: 'never',
  stateWcCovered: 'never',
  // stateWcClassCode is gated by stateWcCovered === true. The predicate also
  // depends implicitly on the work-address state being WA — partners enforce
  // that gate by passing `optionalFieldsToRequire` only for WA employees, or
  // by simply never sending stateWcCovered=true outside WA.
  stateWcClassCode: data => String(data.stateWcCovered) === 'true',
} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Override which fields are required on a given submission mode of {@link useJobForm}.
 *
 * @remarks
 * Each mode key lists the fields that are optional by default for that mode
 * but should be promoted to required. `stateWcClassCode` is automatically
 * required when `stateWcCovered` is `true` and is not configurable here.
 *
 * | Field | Required on create | Required on update | Configurable? |
 * | ----- | ------------------ | ------------------ | ------------- |
 * | `title` | Yes | No | Yes (on update) |
 * | `hireDate` | Yes | No | Yes (on update) |
 * | `twoPercentShareholder` | No | No | Yes (either mode) |
 * | `stateWcCovered` | No | No | Yes (either mode) |
 * | `stateWcClassCode` | When WC is covered | When WC is covered | No (auto) |
 *
 * @public
 *
 * @example
 * ```tsx
 * const job = useJobForm({
 *   employeeId,
 *   jobId,
 *   optionalFieldsToRequire: {
 *     update: ['title', 'hireDate'],
 *   },
 * })
 * ```
 */
export type JobOptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>

interface JobSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: JobOptionalFieldsToRequire
  /**
   * When `false`, drops `hireDate` from the validated shape entirely — the
   * field becomes hook-managed rather than user-facing (e.g. an onboarding
   * screen that derives hireDate from the employee's `startDate`). Partners
   * supply the value at submit time via `JobSubmitOptions.hireDate`.
   * Defaults to `true`.
   */
  withHireDateField?: boolean
  /**
   * When `false`, drops `title` from the validated shape entirely and the
   * hook stops sending it on PUT `/v1/jobs/:id`. Use this when title is
   * being driven via the compensation form instead (steady-state edits,
   * where title is effective-dated alongside rate/unit/FLSA on a future
   * compensation row). Defaults to `true`.
   */
  withTitleField?: boolean
}

/** @internal */
export function createJobSchema(options: JobSchemaOptions = {}) {
  const {
    mode = 'create',
    optionalFieldsToRequire,
    withHireDateField = true,
    withTitleField = true,
  } = options

  const excludeFields: Array<keyof typeof fieldValidators> = []
  if (!withHireDateField) excludeFields.push('hireDate')
  if (!withTitleField) excludeFields.push('title')

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: JobErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields,
  })
}
