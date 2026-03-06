import { z } from 'zod'
import { NAME_REGEX, SSN_REGEX } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'

export const employeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME_FORMAT: 'INVALID_NAME_FORMAT',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  INVALID_SSN_FORMAT: 'INVALID_SSN_FORMAT',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
} as const

export type EmployeeDetailsErrorCode =
  (typeof employeeDetailsErrorCodes)[keyof typeof employeeDetailsErrorCodes]

export type OptionalEmployeeField = 'email' | 'ssn' | 'dateOfBirth'

interface EmployeeDetailsSchemaOptions {
  hasSsn?: boolean
  requiredFields?: OptionalEmployeeField[]
}

export type EmployeeDetailsFormData = z.infer<ReturnType<typeof generateEmployeeDetailsSchema>>

export const generateEmployeeDetailsSchema = (options: EmployeeDetailsSchemaOptions = {}) => {
  const { hasSsn = false, requiredFields = [] } = options
  const required = new Set(requiredFields)

  return z.object({
    firstName: z
      .string()
      .min(1, { message: employeeDetailsErrorCodes.REQUIRED })
      .regex(NAME_REGEX, { message: employeeDetailsErrorCodes.INVALID_NAME_FORMAT }),
    middleInitial: z.string().optional(),
    lastName: z
      .string()
      .min(1, { message: employeeDetailsErrorCodes.REQUIRED })
      .regex(NAME_REGEX, { message: employeeDetailsErrorCodes.INVALID_NAME_FORMAT }),

    email: z.string().superRefine((value, ctx) => {
      if (!value) {
        if (required.has('email')) {
          ctx.addIssue({ code: 'custom', message: employeeDetailsErrorCodes.REQUIRED })
        }
        return
      }
      if (!z.email().safeParse(value).success) {
        ctx.addIssue({ code: 'custom', message: employeeDetailsErrorCodes.INVALID_EMAIL_FORMAT })
      }
    }),

    ssn: z.string().superRefine((value, ctx) => {
      if (hasSsn && !value) return
      if (!value) {
        if (required.has('ssn')) {
          ctx.addIssue({ code: 'custom', message: employeeDetailsErrorCodes.REQUIRED })
        }
        return
      }
      if (!SSN_REGEX.test(removeNonDigits(value))) {
        ctx.addIssue({ code: 'custom', message: employeeDetailsErrorCodes.INVALID_SSN_FORMAT })
      }
    }),

    dateOfBirth: z.string().superRefine((value, ctx) => {
      if (!value) {
        if (required.has('dateOfBirth')) {
          ctx.addIssue({ code: 'custom', message: employeeDetailsErrorCodes.REQUIRED })
        }
        return
      }
      if (!z.iso.date().safeParse(value).success) {
        ctx.addIssue({ code: 'custom', message: employeeDetailsErrorCodes.INVALID_DATE_FORMAT })
      }
    }),
  })
}
