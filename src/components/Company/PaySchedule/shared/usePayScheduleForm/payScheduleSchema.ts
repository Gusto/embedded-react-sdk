import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceToISODate } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

export const PayScheduleErrorCodes = {
  REQUIRED: 'REQUIRED',
  DAY_RANGE: 'DAY_RANGE',
} as const

export type PayScheduleErrorCode =
  (typeof PayScheduleErrorCodes)[keyof typeof PayScheduleErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const FREQUENCY_VALUES = ['Every week', 'Every other week', 'Twice per month', 'Monthly'] as const
export type PayScheduleFrequency = (typeof FREQUENCY_VALUES)[number]

const fieldValidators = {
  customName: z.string(),
  frequency: z.enum(FREQUENCY_VALUES),
  customTwicePerMonth: z.string(),
  anchorPayDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  anchorEndOfPayPeriod: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  day1: z.preprocess(coerceNaN(0), z.number()),
  day2: z.preprocess(coerceNaN(0), z.number()),
}

export type PayScheduleField = keyof typeof fieldValidators

export type PayScheduleFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type PayScheduleFormOutputs = PayScheduleFormData

// ── Required fields config ─────────────────────────────────────────────

function needsDay1(data: PayScheduleFormData): boolean {
  const freq = data.frequency
  const custom = data.customTwicePerMonth
  return freq === 'Monthly' || (freq === 'Twice per month' && custom === 'custom')
}

function needsDay2(data: PayScheduleFormData): boolean {
  const freq = data.frequency
  const custom = data.customTwicePerMonth
  return freq === 'Twice per month' && custom === 'custom'
}

const requiredFieldsConfig = {
  customTwicePerMonth: 'never',
  day1: needsDay1,
  day2: needsDay2,
} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * coerceNaN(0) maps empty inputs to 0, which `isEmpty` does not catch
 * (it only recognizes undefined/null/blank-string). This superRefine
 * enforces the 1–31 range when the field is applicable, which also
 * rejects the 0 sentinel from empty inputs.
 */
function validateDayRanges(data: PayScheduleFormData, ctx: z.RefinementCtx) {
  if (needsDay1(data) && (data.day1 < 1 || data.day1 > 31)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['day1'],
      message: data.day1 < 1 ? PayScheduleErrorCodes.REQUIRED : PayScheduleErrorCodes.DAY_RANGE,
    })
  }
  if (needsDay2(data) && (data.day2 < 1 || data.day2 > 31)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['day2'],
      message: data.day2 < 1 ? PayScheduleErrorCodes.REQUIRED : PayScheduleErrorCodes.DAY_RANGE,
    })
  }
}

// ── Schema factory ─────────────────────────────────────────────────────

export type PayScheduleOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface PayScheduleSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: PayScheduleOptionalFieldsToRequire
}

export function createPayScheduleSchema(options: PayScheduleSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: PayScheduleErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    superRefine: validateDayRanges,
  })
}
