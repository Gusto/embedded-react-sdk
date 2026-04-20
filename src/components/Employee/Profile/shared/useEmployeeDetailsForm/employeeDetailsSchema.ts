import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { SSN_REGEX, NAME_REGEX } from '@/helpers/validations'

// ── Error codes ────────────────────────────────────────────────────────

export const EmployeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_SSN: 'INVALID_SSN',
  EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING',
} as const

export type EmployeeDetailsErrorCode =
  (typeof EmployeeDetailsErrorCodes)[keyof typeof EmployeeDetailsErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

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

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  firstName: 'create',
  lastName: 'create',
  middleInitial: 'never',
  email: 'never',
  dateOfBirth: 'never',
  ssn: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

export type EmployeeDetailsOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface EmployeeDetailsSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
  hasSsn?: boolean
}

export function createEmployeeDetailsSchema(options: EmployeeDetailsSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, hasSsn = false } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: EmployeeDetailsErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    fieldsWithRedactedValues: hasSsn ? ['ssn'] : [],
    superRefine:
      mode === 'create'
        ? (data, ctx) => {
            if (data.selfOnboarding && (!data.email || data.email.trim() === '')) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['email'],
                message: EmployeeDetailsErrorCodes.EMAIL_REQUIRED_FOR_SELF_ONBOARDING,
              })
            }
          }
        : undefined,
  })
}
