import { z } from 'zod'
import { NAME_REGEX, SSN_REGEX } from '@/helpers/validations'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { requiredIf, type ExtractConfigurableKeys } from '@/helpers/requiredIf'

export const employeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME_FORMAT: 'INVALID_NAME_FORMAT',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  INVALID_SSN_FORMAT: 'INVALID_SSN_FORMAT',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
} as const

export type EmployeeDetailsErrorCode =
  (typeof employeeDetailsErrorCodes)[keyof typeof employeeDetailsErrorCodes]

interface EmployeeDetailsSchemaOptions {
  mode?: 'create' | 'update'
  hasSsn?: boolean
  optionalFieldsToRequire?: string[]
}

export type EmployeeDetailsSchema = ReturnType<typeof generateEmployeeDetailsSchema>
export type EmployeeDetailsFormData = z.infer<EmployeeDetailsSchema>

export const EMPLOYEE_CREATE_REQUIRED_FIELDS = ['firstName', 'lastName'] as const
export type EmployeeCreateRequiredField = (typeof EMPLOYEE_CREATE_REQUIRED_FIELDS)[number]

export function generateEmployeeDetailsSchema(options: EmployeeDetailsSchemaOptions = {}) {
  const { mode = 'create', hasSsn = false, optionalFieldsToRequire = [] } = options
  const required = new Set(optionalFieldsToRequire)
  const isCreate = mode === 'create'

  return z.object({
    firstName: requiredIf(
      z
        .string({ error: () => employeeDetailsErrorCodes.REQUIRED })
        .min(1, { message: employeeDetailsErrorCodes.REQUIRED })
        .regex(NAME_REGEX, { message: employeeDetailsErrorCodes.INVALID_NAME_FORMAT }),
      isCreate || required.has('firstName'),
    ),
    middleInitial: requiredIf(
      z.string({ error: () => employeeDetailsErrorCodes.REQUIRED }),
      required.has('middleInitial'),
    ),
    lastName: requiredIf(
      z
        .string({ error: () => employeeDetailsErrorCodes.REQUIRED })
        .min(1, { message: employeeDetailsErrorCodes.REQUIRED })
        .regex(NAME_REGEX, { message: employeeDetailsErrorCodes.INVALID_NAME_FORMAT }),
      isCreate || required.has('lastName'),
    ),
    email: requiredIf(
      z.email({
        error: issue =>
          typeof issue.input === 'string' && issue.input.length === 0
            ? employeeDetailsErrorCodes.REQUIRED
            : employeeDetailsErrorCodes.INVALID_EMAIL_FORMAT,
      }),
      required.has('email'),
    ),
    ssn: requiredIf(
      z
        .string({ error: () => employeeDetailsErrorCodes.REQUIRED })
        .refine((v: string) => SSN_REGEX.test(removeNonDigits(v)), {
          message: employeeDetailsErrorCodes.INVALID_SSN_FORMAT,
        }),
      !hasSsn && required.has('ssn'),
    ),
    dateOfBirth: requiredIf(
      z.iso.date({
        error: issue =>
          typeof issue.input === 'string' && issue.input.length === 0
            ? employeeDetailsErrorCodes.REQUIRED
            : employeeDetailsErrorCodes.INVALID_DATE_FORMAT,
      }),
      required.has('dateOfBirth'),
    ),
    selfOnboarding: z.boolean().default(false),
  })
}

export type OptionalEmployeeField = ExtractConfigurableKeys<EmployeeDetailsSchema>
