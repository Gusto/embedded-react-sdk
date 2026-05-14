import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceToISODate, coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

export const JobErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type JobErrorCode = (typeof JobErrorCodes)[keyof typeof JobErrorCodes]

const fieldValidators = {
  title: z.string(),
  hireDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  twoPercentShareholder: z.boolean(),
  // Radio group delivers 'true'/'false' strings; coerceStringBoolean converts to boolean.
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  stateWcClassCode: z.string(),
}

export type JobFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
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
}

export function createJobSchema(options: JobSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withHireDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: JobErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withHireDateField ? [] : ['hireDate'],
  })
}
