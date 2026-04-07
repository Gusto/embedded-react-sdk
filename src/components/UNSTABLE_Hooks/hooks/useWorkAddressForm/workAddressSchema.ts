import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '../../form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const WorkAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type WorkAddressErrorCode =
  (typeof WorkAddressErrorCodes)[keyof typeof WorkAddressErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  locationUuid: z.string().min(1, { message: WorkAddressErrorCodes.REQUIRED }),
  effectiveDate: z.iso.date({ error: () => WorkAddressErrorCodes.REQUIRED }),
}

export type WorkAddressField = keyof typeof fieldValidators

export type WorkAddressFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type WorkAddressFormOutputs = WorkAddressFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  effectiveDate: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

export type WorkAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface WorkAddressSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  withEffectiveDateField?: boolean
}

export function createWorkAddressSchema(options: WorkAddressSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withEffectiveDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: WorkAddressErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withEffectiveDateField ? [] : ['effectiveDate'],
  })
}
