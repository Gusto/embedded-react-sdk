import { z } from 'zod'
import { STATES_ABBR } from '@/shared/constants'

export type StateAbbr = (typeof STATES_ABBR)[number]

export const homeAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ZIP_FORMAT: 'INVALID_ZIP_FORMAT',
} as const

export type HomeAddressErrorCode =
  (typeof homeAddressErrorCodes)[keyof typeof homeAddressErrorCodes]

export const generateHomeAddressSchema = () =>
  z.object({
    street1: z.string().min(1, { message: homeAddressErrorCodes.REQUIRED }),
    street2: z.string().optional(),
    city: z.string().min(1, { message: homeAddressErrorCodes.REQUIRED }),
    state: z.enum(STATES_ABBR, homeAddressErrorCodes.REQUIRED),
    zip: z.string().superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({ code: 'custom', message: homeAddressErrorCodes.REQUIRED })
        return
      }
      if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value)) {
        ctx.addIssue({ code: 'custom', message: homeAddressErrorCodes.INVALID_ZIP_FORMAT })
      }
    }),
    courtesyWithholding: z.boolean(),
  })

export type HomeAddressSchema = ReturnType<typeof generateHomeAddressSchema>
export type HomeAddressFormData = z.infer<HomeAddressSchema>
