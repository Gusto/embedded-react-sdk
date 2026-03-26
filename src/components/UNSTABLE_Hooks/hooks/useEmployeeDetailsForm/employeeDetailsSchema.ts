import { z } from 'zod'
import { composeFormSchema } from '../../form/composeFormSchema'
import { filterRequiredFields, type RequiredFields } from '../../form/resolveRequiredFields'
import { SSN_REGEX, NAME_REGEX } from '@/helpers/validations'

export const EmployeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_SSN: 'INVALID_SSN',
  EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING',
} as const

export type EmployeeDetailsErrorCode =
  (typeof EmployeeDetailsErrorCodes)[keyof typeof EmployeeDetailsErrorCodes]

const fieldValidators = {
  firstName: z
    .string()
    .min(1, { message: EmployeeDetailsErrorCodes.REQUIRED })
    .regex(NAME_REGEX, { message: EmployeeDetailsErrorCodes.INVALID_NAME }),
  middleInitial: z.string(),
  lastName: z
    .string()
    .min(1, { message: EmployeeDetailsErrorCodes.REQUIRED })
    .regex(NAME_REGEX, { message: EmployeeDetailsErrorCodes.INVALID_NAME }),
  email: z.email({
    error: issue =>
      typeof issue.input === 'string' && issue.input.length === 0
        ? EmployeeDetailsErrorCodes.REQUIRED
        : EmployeeDetailsErrorCodes.INVALID_EMAIL,
  }),
  dateOfBirth: z.iso.date({ error: () => EmployeeDetailsErrorCodes.REQUIRED }),
  ssn: z
    .string({ error: () => EmployeeDetailsErrorCodes.REQUIRED })
    .refine((v: string) => SSN_REGEX.test(v.replace(/\D/g, '')), {
      message: EmployeeDetailsErrorCodes.INVALID_SSN,
    }),
  selfOnboarding: z.boolean(),
}

export type EmployeeDetailsField = Exclude<keyof typeof fieldValidators, 'selfOnboarding'>

export type EmployeeDetailsFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type EmployeeDetailsFormOutputs = EmployeeDetailsFormData

const FIXED_FIELDS = new Set(['selfOnboarding'])
const REQUIRED_ON_CREATE = new Set<EmployeeDetailsField>(['firstName', 'lastName'])

interface EmployeeDetailsSchemaOptions {
  mode?: 'create' | 'update'
  requiredFields?: RequiredFields<EmployeeDetailsField>
  hasSsn?: boolean
}

export function createEmployeeDetailsSchema(options: EmployeeDetailsSchemaOptions = {}) {
  const { mode = 'create', requiredFields, hasSsn = false } = options

  const effectiveRequiredFields = hasSsn
    ? filterRequiredFields(requiredFields, 'ssn')
    : requiredFields

  const baseSchema = composeFormSchema({
    fieldValidators,
    fixedFields: FIXED_FIELDS,
    requiredOnCreate: REQUIRED_ON_CREATE,
    mode,
    requiredFields: effectiveRequiredFields,
  })

  if (mode === 'create') {
    return baseSchema.superRefine((data, ctx) => {
      const { selfOnboarding, email } = data as EmployeeDetailsFormData
      if (selfOnboarding && (!email || email.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: EmployeeDetailsErrorCodes.EMAIL_REQUIRED_FOR_SELF_ONBOARDING,
        })
      }
    })
  }

  return baseSchema
}
