import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceToISODate, coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

/**
 * Validation error codes emitted by the `useJobForm` schema. Map these to localized
 * error text via the `validationMessages` prop on each field.
 *
 * @public
 */
export const JobErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code values emitted by `useJobForm` fields.
 *
 * @public
 */
export type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes]

const fieldValidators = {
  title: z.string(),
  hireDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  twoPercentShareholder: z.boolean(),
  // Radio group delivers 'true'/'false' strings; coerceStringBoolean converts to boolean.
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  stateWcClassCode: z.string(),
}

/**
 * Shape of the form values managed by `useJobForm` — title, hire date, S-Corp 2%
 * shareholder flag, and the two Washington state workers' compensation fields.
 * Use as the `defaultValues` shape passed into `useJobForm`.
 *
 * @public
 */
export type JobFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated submission payload produced by the `useJobForm` schema
 * after preprocessing (e.g. hireDate ISO coercion, stateWcCovered string-to-boolean).
 * Identical in shape to {@link JobFormData}.
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
 * Override which fields are required on each `useJobForm` mode. Pass via the
 * `optionalFieldsToRequire` prop on `useJobForm` to promote otherwise-optional
 * fields to required for a given mode.
 *
 * @remarks
 * `title` and `hireDate` default to required on create and optional on update;
 * `twoPercentShareholder` and `stateWcCovered` default to optional in both modes.
 * `stateWcClassCode` is automatically required whenever `stateWcCovered` is `true`
 * regardless of this setting.
 *
 * @public
 *
 * @example
 * ```ts
 * const job = useJobForm({
 *   employeeId,
 *   jobId,
 *   optionalFieldsToRequire: { update: ['title', 'hireDate'] },
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

/**
 * Builds the Zod schema and field metadata used by `useJobForm`. Resolves which
 * fields are required for the given mode, applies any `optionalFieldsToRequire`
 * overrides, and drops `hireDate` / `title` from the validated shape when their
 * corresponding `withHireDateField` / `withTitleField` flags are `false`.
 *
 * @param options - Schema configuration including `mode`, `optionalFieldsToRequire`,
 *   `withHireDateField`, and `withTitleField`.
 * @returns A tuple of the Zod schema and the derived field metadata config for
 *   driving `useJobForm`'s `fieldsMetadata`.
 * @public
 */
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
