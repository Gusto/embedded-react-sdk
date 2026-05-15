import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { SPLIT_BY } from '@/shared/constants'

export const SplitPaymentsFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PERCENTAGE_TOTAL_MISMATCH: 'PERCENTAGE_TOTAL_MISMATCH',
  DUPLICATE_PRIORITIES: 'DUPLICATE_PRIORITIES',
} as const

export type SplitPaymentsFormErrorCode =
  (typeof SplitPaymentsFormErrorCodes)[keyof typeof SplitPaymentsFormErrorCodes]

export const SPLIT_BY_VALUES = [SPLIT_BY.percentage, SPLIT_BY.amount] as const
export type SplitByValue = (typeof SPLIT_BY_VALUES)[number]

const fieldValidators = {
  splitBy: z.enum(SPLIT_BY_VALUES),
  splitAmount: z.record(z.string(), z.number().nullable()),
  priority: z.record(z.string(), z.number()),
  remainder: z.string(),
}

export type SplitPaymentsFormField = keyof typeof fieldValidators

export type SplitPaymentsFormData = {
  splitBy: SplitByValue
  splitAmount: Record<string, number | null>
  priority: Record<string, number>
  remainder: string
}
export type SplitPaymentsFormOutputs = SplitPaymentsFormData

const requiredFieldsConfig = {
  remainder: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

export type SplitPaymentsFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface SplitPaymentsFormSchemaOptions {
  optionalFieldsToRequire?: SplitPaymentsFormOptionalFieldsToRequire
}

export function createSplitPaymentsFormSchema(options: SplitPaymentsFormSchemaOptions = {}) {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: SplitPaymentsFormErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire: options.optionalFieldsToRequire,
    superRefine: (data, ctx) => {
      if (data.splitBy === SPLIT_BY.percentage) {
        for (const [uuid, value] of Object.entries(data.splitAmount)) {
          if (value === null) continue
          if (!Number.isInteger(value) || value < 0 || value > 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['splitAmount', uuid],
              message: SplitPaymentsFormErrorCodes.INVALID_PERCENTAGE,
            })
          }
        }
        const total = Object.values(data.splitAmount).reduce<number>((acc, v) => acc + (v ?? 0), 0)
        if (total !== 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['splitAmount'],
            message: SplitPaymentsFormErrorCodes.PERCENTAGE_TOTAL_MISMATCH,
          })
        }
      } else {
        for (const [uuid, value] of Object.entries(data.splitAmount)) {
          if (value === null) continue
          if (value < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['splitAmount', uuid],
              message: SplitPaymentsFormErrorCodes.INVALID_AMOUNT,
            })
          }
        }
        const priorities = Object.values(data.priority)
        if (new Set(priorities).size !== priorities.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['priority'],
            message: SplitPaymentsFormErrorCodes.DUPLICATE_PRIORITIES,
          })
        }
      }
    },
  })
}
