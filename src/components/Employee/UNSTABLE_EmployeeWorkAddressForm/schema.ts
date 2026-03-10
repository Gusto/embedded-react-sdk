import { z } from 'zod'
import { requiredIf, type ExtractConfigurableKeys } from '@/helpers/requiredIf'

export const workAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
} as const

export type WorkAddressErrorCode =
  (typeof workAddressErrorCodes)[keyof typeof workAddressErrorCodes]

interface WorkAddressSchemaOptions {
  optionalFieldsToRequire?: string[]
}

export type WorkAddressFormData = z.infer<ReturnType<typeof generateWorkAddressSchema>>

export function generateWorkAddressSchema(options: WorkAddressSchemaOptions = {}) {
  const required = new Set(options.optionalFieldsToRequire ?? [])

  return z.object({
    locationUuid: z.string().min(1, { message: workAddressErrorCodes.REQUIRED }),
    effectiveDate: requiredIf(
      z.iso.date({
        error: issue =>
          typeof issue.input === 'string' && issue.input.length === 0
            ? workAddressErrorCodes.REQUIRED
            : workAddressErrorCodes.INVALID_DATE_FORMAT,
      }),
      required.has('effectiveDate'),
    ),
  })
}

export type OptionalWorkAddressField = ExtractConfigurableKeys<
  ReturnType<typeof generateWorkAddressSchema>
>
