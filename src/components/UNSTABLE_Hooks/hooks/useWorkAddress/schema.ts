import { z } from 'zod'

export const workAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type WorkAddressErrorCode =
  (typeof workAddressErrorCodes)[keyof typeof workAddressErrorCodes]

export const generateWorkAddressSchema = () =>
  z.object({
    locationUuid: z.string().min(1, { message: workAddressErrorCodes.REQUIRED }),
    effectiveDate: z.date({ message: workAddressErrorCodes.REQUIRED }),
  })

export type WorkAddressSchema = ReturnType<typeof generateWorkAddressSchema>
export type WorkAddressFormData = z.infer<WorkAddressSchema>
