import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
  type ValidatorsFor,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const SignCompanyFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type SignCompanyFormErrorCode =
  (typeof SignCompanyFormErrorCodes)[keyof typeof SignCompanyFormErrorCodes]

// ── Form data types ────────────────────────────────────────────────────

export interface SignCompanyFormData {
  signature: string
  confirmSignature: boolean
}
export type SignCompanyFormOutputs = SignCompanyFormData

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  signature: z.string().min(1, { message: SignCompanyFormErrorCodes.REQUIRED }),
  confirmSignature: z.boolean().refine(val => val, {
    message: SignCompanyFormErrorCodes.REQUIRED,
  }),
} satisfies ValidatorsFor<SignCompanyFormData>

export type SignCompanyFormField = keyof SignCompanyFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

export type SignCompanyFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface SignCompanyFormSchemaOptions {
  optionalFieldsToRequire?: SignCompanyFormOptionalFieldsToRequire
}

export function createSignCompanyFormSchema(options: SignCompanyFormSchemaOptions = {}) {
  const { optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: SignCompanyFormErrorCodes.REQUIRED,
    mode: 'create',
    optionalFieldsToRequire,
  })
}
