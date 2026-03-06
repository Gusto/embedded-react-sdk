import { z } from 'zod'
import { NAME_REGEX, SSN_REGEX } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { SIGNATORY_TITLES, STATES_ABBR } from '@/shared/constants'

export type SignatoryTitle = (typeof SIGNATORY_TITLES)[keyof typeof SIGNATORY_TITLES]
const signatoryTitleValues = Object.values(SIGNATORY_TITLES) as [
  SignatoryTitle,
  ...SignatoryTitle[],
]

export type StateAbbr = (typeof STATES_ABBR)[number]

export const signatoryErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME_FORMAT: 'INVALID_NAME_FORMAT',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  INVALID_SSN_FORMAT: 'INVALID_SSN_FORMAT',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
} as const

export type SignatoryErrorCode = (typeof signatoryErrorCodes)[keyof typeof signatoryErrorCodes]

export type SignatoryFormData = z.infer<ReturnType<typeof generateSignatorySchema>>

export const generateSignatorySchema = (hasSsn?: boolean) =>
  z.object({
    firstName: z
      .string()
      .min(1, { message: signatoryErrorCodes.REQUIRED })
      .regex(NAME_REGEX, { message: signatoryErrorCodes.INVALID_NAME_FORMAT }),
    middleInitial: z.string().optional(),
    lastName: z
      .string()
      .min(1, { message: signatoryErrorCodes.REQUIRED })
      .regex(NAME_REGEX, { message: signatoryErrorCodes.INVALID_NAME_FORMAT }),
    email: z.email({
      error: issue =>
        typeof issue.input === 'string' && issue.input.length === 0
          ? signatoryErrorCodes.REQUIRED
          : signatoryErrorCodes.INVALID_EMAIL_FORMAT,
    }),
    title: z.enum(signatoryTitleValues, signatoryErrorCodes.REQUIRED),
    phone: z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
    ssn: z.string().superRefine((value, ctx) => {
      if (hasSsn && !value) return
      if (!value) {
        ctx.addIssue({ code: 'custom', message: signatoryErrorCodes.REQUIRED })
        return
      }
      if (!SSN_REGEX.test(removeNonDigits(value))) {
        ctx.addIssue({ code: 'custom', message: signatoryErrorCodes.INVALID_SSN_FORMAT })
      }
    }),
    birthday: z.iso.date({
      error: issue =>
        typeof issue.input === 'string' && issue.input.length === 0
          ? signatoryErrorCodes.REQUIRED
          : signatoryErrorCodes.INVALID_DATE_FORMAT,
    }),
    street1: z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
    street2: z.string().optional(),
    city: z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
    state: z.enum(STATES_ABBR, signatoryErrorCodes.REQUIRED),
    zip: z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
  })
