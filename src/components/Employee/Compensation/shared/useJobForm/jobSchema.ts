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
}

export function createJobSchema(options: JobSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: JobErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
  })
}
