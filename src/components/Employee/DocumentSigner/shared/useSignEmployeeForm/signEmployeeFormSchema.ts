import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const SignEmployeeFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  CONFIRMATION_REQUIRED: 'CONFIRMATION_REQUIRED',
} as const

export type SignEmployeeFormErrorCode =
  (typeof SignEmployeeFormErrorCodes)[keyof typeof SignEmployeeFormErrorCodes]

// ── Preparer naming helpers ────────────────────────────────────────────

export const MAX_PREPARERS = 4

export type PreparerIndex = 1 | 2 | 3 | 4

export type PreparerFieldSuffix =
  | 'FirstName'
  | 'LastName'
  | 'Street1'
  | 'Street2'
  | 'City'
  | 'State'
  | 'Zip'
  | 'Signature'
  | 'Agree'

export function preparerFieldName(index: PreparerIndex, field: PreparerFieldSuffix): string {
  return index === 1 ? `preparer${field}` : `preparer${index}${field}`
}

// ── Preparer field name constants ──────────────────────────────────────

type PreparerFieldMap = Record<
  | 'firstName'
  | 'lastName'
  | 'street1'
  | 'street2'
  | 'city'
  | 'state'
  | 'zip'
  | 'signature'
  | 'agree',
  SignEmployeeFormField
>

const PREPARER_1 = {
  firstName: 'preparerFirstName',
  lastName: 'preparerLastName',
  street1: 'preparerStreet1',
  street2: 'preparerStreet2',
  city: 'preparerCity',
  state: 'preparerState',
  zip: 'preparerZip',
  signature: 'preparerSignature',
  agree: 'preparerAgree',
} as const

const PREPARER_2 = {
  firstName: 'preparer2FirstName',
  lastName: 'preparer2LastName',
  street1: 'preparer2Street1',
  street2: 'preparer2Street2',
  city: 'preparer2City',
  state: 'preparer2State',
  zip: 'preparer2Zip',
  signature: 'preparer2Signature',
  agree: 'preparer2Agree',
} as const

const PREPARER_3 = {
  firstName: 'preparer3FirstName',
  lastName: 'preparer3LastName',
  street1: 'preparer3Street1',
  street2: 'preparer3Street2',
  city: 'preparer3City',
  state: 'preparer3State',
  zip: 'preparer3Zip',
  signature: 'preparer3Signature',
  agree: 'preparer3Agree',
} as const

const PREPARER_4 = {
  firstName: 'preparer4FirstName',
  lastName: 'preparer4LastName',
  street1: 'preparer4Street1',
  street2: 'preparer4Street2',
  city: 'preparer4City',
  state: 'preparer4State',
  zip: 'preparer4Zip',
  signature: 'preparer4Signature',
  agree: 'preparer4Agree',
} as const

export const PREPARERS_BY_INDEX = [
  PREPARER_1,
  PREPARER_2,
  PREPARER_3,
  PREPARER_4,
] satisfies PreparerFieldMap[]

// ── Per-preparer field name lists (used for excludeFields) ──────────────

type ValuesOf<T> = T[keyof T]

const PREPARER_1_FIELDS: SignEmployeeFormField[] = Object.values(PREPARER_1) as ValuesOf<
  typeof PREPARER_1
>[]
const PREPARER_2_FIELDS: SignEmployeeFormField[] = Object.values(PREPARER_2) as ValuesOf<
  typeof PREPARER_2
>[]
const PREPARER_3_FIELDS: SignEmployeeFormField[] = Object.values(PREPARER_3) as ValuesOf<
  typeof PREPARER_3
>[]
const PREPARER_4_FIELDS: SignEmployeeFormField[] = Object.values(PREPARER_4) as ValuesOf<
  typeof PREPARER_4
>[]

export const PREPARER_FIELDS_BY_INDEX: SignEmployeeFormField[][] = [
  PREPARER_1_FIELDS,
  PREPARER_2_FIELDS,
  PREPARER_3_FIELDS,
  PREPARER_4_FIELDS,
]

const ALL_PREPARER_FIELDS = PREPARER_FIELDS_BY_INDEX.flat()

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  signature: z.string(),
  confirmSignature: z.boolean(),
  usedPreparer: z.enum(['yes', 'no']),

  // Preparer 1
  [PREPARER_1.firstName]: z.string(),
  [PREPARER_1.lastName]: z.string(),
  [PREPARER_1.street1]: z.string(),
  [PREPARER_1.street2]: z.string(),
  [PREPARER_1.city]: z.string(),
  [PREPARER_1.state]: z.string(),
  [PREPARER_1.zip]: z.string(),
  [PREPARER_1.signature]: z.string(),
  [PREPARER_1.agree]: z.boolean(),

  // Preparer 2
  [PREPARER_2.firstName]: z.string(),
  [PREPARER_2.lastName]: z.string(),
  [PREPARER_2.street1]: z.string(),
  [PREPARER_2.street2]: z.string(),
  [PREPARER_2.city]: z.string(),
  [PREPARER_2.state]: z.string(),
  [PREPARER_2.zip]: z.string(),
  [PREPARER_2.signature]: z.string(),
  [PREPARER_2.agree]: z.boolean(),

  // Preparer 3
  [PREPARER_3.firstName]: z.string(),
  [PREPARER_3.lastName]: z.string(),
  [PREPARER_3.street1]: z.string(),
  [PREPARER_3.street2]: z.string(),
  [PREPARER_3.city]: z.string(),
  [PREPARER_3.state]: z.string(),
  [PREPARER_3.zip]: z.string(),
  [PREPARER_3.signature]: z.string(),
  [PREPARER_3.agree]: z.boolean(),

  // Preparer 4
  [PREPARER_4.firstName]: z.string(),
  [PREPARER_4.lastName]: z.string(),
  [PREPARER_4.street1]: z.string(),
  [PREPARER_4.street2]: z.string(),
  [PREPARER_4.city]: z.string(),
  [PREPARER_4.state]: z.string(),
  [PREPARER_4.zip]: z.string(),
  [PREPARER_4.signature]: z.string(),
  [PREPARER_4.agree]: z.boolean(),
}

export type SignEmployeeFormField = keyof typeof fieldValidators

export type SignEmployeeFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type SignEmployeeFormOutputs = SignEmployeeFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  [PREPARER_1.street2]: 'never',
  [PREPARER_2.street2]: 'never',
  [PREPARER_3.street2]: 'never',
  [PREPARER_4.street2]: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

interface SignEmployeeFormSchemaOptions {
  isI9?: boolean
  preparerCount?: number
}

export function createSignEmployeeFormSchema(options: SignEmployeeFormSchemaOptions = {}) {
  const { isI9 = false, preparerCount = 0 } = options

  const excludeFields: SignEmployeeFormField[] = []

  if (!isI9) {
    excludeFields.push('usedPreparer', ...ALL_PREPARER_FIELDS)
  } else {
    for (let index = 0; index < MAX_PREPARERS; index++) {
      if (index + 1 > preparerCount) {
        const preparerFields = PREPARER_FIELDS_BY_INDEX[index]
        if (preparerFields) excludeFields.push(...preparerFields)
      }
    }
  }

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: SignEmployeeFormErrorCodes.REQUIRED,
    mode: 'create',
    excludeFields,
    superRefine: (data, ctx) => {
      if (!data.confirmSignature) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmSignature'],
          message: SignEmployeeFormErrorCodes.CONFIRMATION_REQUIRED,
        })
      }

      if (isI9) {
        const agreeFields = [PREPARER_1.agree, PREPARER_2.agree, PREPARER_3.agree, PREPARER_4.agree]
        for (let index = 0; index < preparerCount; index++) {
          const agreeName = agreeFields[index]!
          if (!(data as Record<string, unknown>)[agreeName]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [agreeName],
              message: SignEmployeeFormErrorCodes.CONFIRMATION_REQUIRED,
            })
          }
        }
      }
    },
  })
}
