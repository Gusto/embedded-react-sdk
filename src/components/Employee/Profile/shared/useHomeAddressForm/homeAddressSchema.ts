import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const HomeAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ZIP: 'INVALID_ZIP',
} as const

export type HomeAddressErrorCode =
  (typeof HomeAddressErrorCodes)[keyof typeof HomeAddressErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const ZIP_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/

const fieldValidators = {
  street1: z.string(),
  street2: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string().regex(ZIP_REGEX, { message: HomeAddressErrorCodes.INVALID_ZIP }),
  courtesyWithholding: z.boolean(),
  effectiveDate: z.iso.date({ error: () => HomeAddressErrorCodes.REQUIRED }),
}

export type HomeAddressField = keyof typeof fieldValidators

export type HomeAddressFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type HomeAddressFormOutputs = HomeAddressFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  street2: 'never',
  effectiveDate: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

export type HomeAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface HomeAddressSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  withEffectiveDateField?: boolean
}

export function createHomeAddressSchema(options: HomeAddressSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withEffectiveDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: HomeAddressErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withEffectiveDateField ? [] : ['effectiveDate'],
  })
}
