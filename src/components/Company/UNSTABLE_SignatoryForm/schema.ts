import { z } from 'zod'
import { NAME_REGEX, SSN_REGEX } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { SIGNATORY_TITLES, STATES_ABBR } from '@/shared/constants'
import { requiredIf } from '@/helpers/requiredIf'

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

interface SignatorySchemaOptions {
  mode?: 'create' | 'update'
  hasSsn?: boolean
  optionalFieldsToRequire?: string[]
}

export const SIGNATORY_CREATE_REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'title',
  'phone',
  'birthday',
  'street1',
  'city',
  'state',
  'zip',
] as const
export type SignatoryCreateRequiredField = (typeof SIGNATORY_CREATE_REQUIRED_FIELDS)[number]

export function generateSignatorySchema(options: SignatorySchemaOptions = {}) {
  const { mode = 'create', hasSsn = false, optionalFieldsToRequire = [] } = options
  const required = new Set(optionalFieldsToRequire)
  const isCreate = mode === 'create'

  return z.object({
    firstName: requiredIf(
      z
        .string()
        .min(1, { message: signatoryErrorCodes.REQUIRED })
        .regex(NAME_REGEX, { message: signatoryErrorCodes.INVALID_NAME_FORMAT }),
      isCreate || required.has('firstName'),
    ),
    middleInitial: z.string().optional(),
    lastName: requiredIf(
      z
        .string()
        .min(1, { message: signatoryErrorCodes.REQUIRED })
        .regex(NAME_REGEX, { message: signatoryErrorCodes.INVALID_NAME_FORMAT }),
      isCreate || required.has('lastName'),
    ),
    email: requiredIf(
      z.email({
        error: issue =>
          typeof issue.input === 'string' && issue.input.length === 0
            ? signatoryErrorCodes.REQUIRED
            : signatoryErrorCodes.INVALID_EMAIL_FORMAT,
      }),
      isCreate || required.has('email'),
    ),
    title: requiredIf(
      z.enum(signatoryTitleValues, signatoryErrorCodes.REQUIRED),
      isCreate || required.has('title'),
    ),
    phone: requiredIf(
      z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
      isCreate || required.has('phone'),
    ),
    ssn: z.string().superRefine((value, ctx) => {
      if ((hasSsn || mode === 'update') && !value) return
      if (!value) {
        ctx.addIssue({ code: 'custom', message: signatoryErrorCodes.REQUIRED })
        return
      }
      if (!SSN_REGEX.test(removeNonDigits(value))) {
        ctx.addIssue({ code: 'custom', message: signatoryErrorCodes.INVALID_SSN_FORMAT })
      }
    }),
    birthday: requiredIf(
      z.iso.date({
        error: issue =>
          typeof issue.input === 'string' && issue.input.length === 0
            ? signatoryErrorCodes.REQUIRED
            : signatoryErrorCodes.INVALID_DATE_FORMAT,
      }),
      isCreate || required.has('birthday'),
    ),
    street1: requiredIf(
      z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
      isCreate || required.has('street1'),
    ),
    street2: z.string().optional(),
    city: requiredIf(
      z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
      isCreate || required.has('city'),
    ),
    state: requiredIf(
      z.enum(STATES_ABBR, signatoryErrorCodes.REQUIRED),
      isCreate || required.has('state'),
    ),
    zip: requiredIf(
      z.string().min(1, { message: signatoryErrorCodes.REQUIRED }),
      isCreate || required.has('zip'),
    ),
  })
}
