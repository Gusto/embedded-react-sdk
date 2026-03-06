import { z } from 'zod'

export const workAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
} as const

export type WorkAddressErrorCode =
  (typeof workAddressErrorCodes)[keyof typeof workAddressErrorCodes]

export type OptionalWorkAddressField = 'effectiveDate'

interface WorkAddressSchemaOptions {
  requiredFields?: OptionalWorkAddressField[]
}

export type WorkAddressFormData = z.infer<ReturnType<typeof generateWorkAddressSchema>>

export const generateWorkAddressSchema = (options: WorkAddressSchemaOptions = {}) => {
  const required = new Set(options.requiredFields ?? [])

  return z.object({
    locationUuid: z.string().min(1, { message: workAddressErrorCodes.REQUIRED }),
    effectiveDate: z.string().superRefine((value, ctx) => {
      if (!value) {
        if (required.has('effectiveDate')) {
          ctx.addIssue({ code: 'custom', message: workAddressErrorCodes.REQUIRED })
        }
        return
      }
      if (!z.iso.date().safeParse(value).success) {
        ctx.addIssue({ code: 'custom', message: workAddressErrorCodes.INVALID_DATE_FORMAT })
      }
    }),
  })
}
