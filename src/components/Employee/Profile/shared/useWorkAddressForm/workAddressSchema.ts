import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
  type ValidatorsFor,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const WorkAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type WorkAddressErrorCode =
  (typeof WorkAddressErrorCodes)[keyof typeof WorkAddressErrorCodes]

// ── Form data types ────────────────────────────────────────────────────

export interface WorkAddressFormData {
  locationUuid: string
  effectiveDate: string
}
export type WorkAddressFormOutputs = WorkAddressFormData

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  locationUuid: z.string().min(1, { message: WorkAddressErrorCodes.REQUIRED }),
  effectiveDate: z.iso.date({ error: () => WorkAddressErrorCodes.REQUIRED }),
} satisfies ValidatorsFor<WorkAddressFormData>

export type WorkAddressField = keyof typeof fieldValidators

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

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
