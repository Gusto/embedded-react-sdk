import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { SSN_REGEX, NAME_REGEX } from '@/helpers/validations'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the employee details form schema. Map
 * these codes to localized copy in `validationMessages` when composing the
 * hook.
 *
 * @public
 */
export const EmployeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_SSN: 'INVALID_SSN',
} as const

/**
 * Union of validation error code strings emitted by the employee details form
 * schema.
 *
 * @public
 */
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
  email: z.email({ error: () => EmployeeDetailsErrorCodes.INVALID_EMAIL }),
  dateOfBirth: z.iso.date({ error: () => EmployeeDetailsErrorCodes.REQUIRED }),
  ssn: z
    .string({ error: () => EmployeeDetailsErrorCodes.REQUIRED })
    .refine((v: string) => SSN_REGEX.test(v.replace(/\D/g, '')), {
      message: EmployeeDetailsErrorCodes.INVALID_SSN,
    }),
  selfOnboarding: z.boolean(),
}

/**
 * Field names accepted by the employee details form.
 *
 * @public
 */
export type EmployeeDetailsField = Exclude<keyof typeof fieldValidators, 'selfOnboarding'>

/**
 * Shape of the values managed by the employee details form.
 *
 * @public
 * @interface
 */
export type EmployeeDetailsFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/** @internal */
export type EmployeeDetailsFormOutputs = EmployeeDetailsFormData

// ── Required fields config ─────────────────────────────────────────────

// Requiredness mirrors the employee create/update API contract: fields the API
// requires on create are `'create'` (optional on update), and fields the API
// treats as optional are `'never'`.
//
// `email` is value-conditional: it always applies but is only required when
// self-onboarding is on (create and update), matching the API's "if
// self_onboarding is true, then email is required" — the employee needs an
// email to receive the invitation. A single-operand predicate keeps
// `buildFormSchema`'s dependency-detecting Proxy accurate, and the predicate
// drives both validation and `fieldsMetadata.isRequired` so the rendered label
// and validation always agree. Consumers that need email required regardless of
// self-onboarding promote it via `optionalFieldsToRequire`.
const requiredFieldsConfig = {
  firstName: 'create',
  lastName: 'create',
  middleInitial: 'never',
  dateOfBirth: 'never',
  ssn: 'never',
  email: data => data.selfOnboarding,
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional employee details fields that can be promoted to required
 * via the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type EmployeeDetailsOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface EmployeeDetailsSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
  hasSsn?: boolean
}

/** @internal */
export function createEmployeeDetailsSchema(options: EmployeeDetailsSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, hasSsn = false } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: EmployeeDetailsErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    fieldsWithRedactedValues: hasSsn ? ['ssn'] : [],
  })
}
