import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
  type ValidatorsFor,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const HomeAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ZIP: 'INVALID_ZIP',
} as const

export type HomeAddressErrorCode =
  (typeof HomeAddressErrorCodes)[keyof typeof HomeAddressErrorCodes]

// ── Form data types ────────────────────────────────────────────────────

export interface HomeAddressFormData {
  street1: string
  street2: string
  city: string
  state: string
  zip: string
  courtesyWithholding: boolean
  effectiveDate: string
}
export type HomeAddressFormOutputs = HomeAddressFormData

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
} satisfies ValidatorsFor<HomeAddressFormData>

export type HomeAddressField = keyof typeof fieldValidators

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  street2: 'never',
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
