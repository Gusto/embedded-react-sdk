import { z } from 'zod'
import { FLSA_OVERTIME_SALARY_LIMIT, FlsaStatus } from '@/shared/constants'
import { yearlyRate } from '@/helpers/payRateCalculator'

export const compensationFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
  MINIMUM_WAGE_REQUIRED: 'MINIMUM_WAGE_REQUIRED',
  STATE_WC_CLASS_CODE_REQUIRED: 'STATE_WC_CLASS_CODE_REQUIRED',
  INVALID_PAYMENT_UNIT_FOR_FLSA: 'INVALID_PAYMENT_UNIT_FOR_FLSA',
} as const

export type CompensationFormErrorCode =
  (typeof compensationFormErrorCodes)[keyof typeof compensationFormErrorCodes]

export const FLSA_OPTIONS = [
  FlsaStatus.EXEMPT,
  FlsaStatus.SALARIED_NONEXEMPT,
  FlsaStatus.NONEXEMPT,
  FlsaStatus.OWNER,
  FlsaStatus.COMMISSION_ONLY_EXEMPT,
  FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
] as const

export const PAYMENT_UNIT_OPTIONS = ['Hour', 'Week', 'Month', 'Year', 'Paycheck'] as const

export type CompensationFormBaseSchema = ReturnType<typeof generateCompensationFormBaseSchema>
export type CompensationFormSchema = ReturnType<typeof generateCompensationFormSchema>
export type CompensationFormData = z.infer<CompensationFormSchema>

export type FlsaDerivedValues = Partial<Pick<CompensationFormData, 'paymentUnit' | 'rate'>>

export function getFlsaDerivedValues(
  flsaStatus: string,
  fallbackPaymentUnit?: CompensationFormData['paymentUnit'],
): FlsaDerivedValues {
  if (flsaStatus === FlsaStatus.OWNER) {
    return { paymentUnit: 'Paycheck' }
  }
  if (
    flsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
    flsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT
  ) {
    return { paymentUnit: 'Year', rate: 0 }
  }
  if (fallbackPaymentUnit) {
    return { paymentUnit: fallbackPaymentUnit }
  }
  return {}
}

export interface FlsaFieldOverrides {
  rate: { isDisabled: boolean }
  paymentUnit: { isDisabled: boolean }
  adjustForMinimumWage: { isDisabled: boolean }
  minimumWageId: { isDisabled: boolean }
}

export function getFlsaFieldOverrides(
  flsaStatus: string,
  hasMinimumWages: boolean,
): FlsaFieldOverrides {
  const isCommissionOnly =
    flsaStatus === FlsaStatus.COMMISSION_ONLY_NONEXEMPT ||
    flsaStatus === FlsaStatus.COMMISSION_ONLY_EXEMPT

  const isMinimumWageDisabled = flsaStatus !== FlsaStatus.NONEXEMPT || !hasMinimumWages

  return {
    rate: { isDisabled: isCommissionOnly },
    paymentUnit: { isDisabled: flsaStatus === FlsaStatus.OWNER || isCommissionOnly },
    adjustForMinimumWage: { isDisabled: isMinimumWageDisabled },
    minimumWageId: { isDisabled: isMinimumWageDisabled },
  }
}

export function generateCompensationFormBaseSchema() {
  return z.object({
    jobTitle: z
      .string({ error: () => compensationFormErrorCodes.REQUIRED })
      .min(1, { message: compensationFormErrorCodes.REQUIRED }),
    flsaStatus: z.enum(FLSA_OPTIONS, compensationFormErrorCodes.REQUIRED),
    rate: z.number().optional(),
    paymentUnit: z.enum(PAYMENT_UNIT_OPTIONS, compensationFormErrorCodes.REQUIRED),
    adjustForMinimumWage: z.boolean(),
    minimumWageId: z.string().optional(),
    stateWcCovered: z.boolean().optional(),
    stateWcClassCode: z.string().optional(),
    twoPercentShareholder: z.boolean().optional(),
  })
}

export function generateCompensationFormSchema() {
  return generateCompensationFormBaseSchema().superRefine((data, ctx) => {
    if (data.adjustForMinimumWage && (!data.minimumWageId || data.minimumWageId.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minimumWageId'],
        message: compensationFormErrorCodes.MINIMUM_WAGE_REQUIRED,
      })
    }

    if (
      data.stateWcCovered === true &&
      (!data.stateWcClassCode || data.stateWcClassCode.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stateWcClassCode'],
        message: compensationFormErrorCodes.STATE_WC_CLASS_CODE_REQUIRED,
      })
    }

    const { flsaStatus, paymentUnit, rate } = data

    if (
      flsaStatus === FlsaStatus.EXEMPT ||
      flsaStatus === FlsaStatus.SALARIED_NONEXEMPT ||
      flsaStatus === FlsaStatus.NONEXEMPT
    ) {
      if (
        flsaStatus === FlsaStatus.EXEMPT &&
        rate !== undefined &&
        yearlyRate(rate, paymentUnit) < FLSA_OVERTIME_SALARY_LIMIT
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: compensationFormErrorCodes.RATE_EXEMPT_THRESHOLD,
        })
      }

      if (rate === undefined || rate < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: compensationFormErrorCodes.RATE_MINIMUM,
        })
      }
    } else if (flsaStatus === FlsaStatus.OWNER) {
      if (paymentUnit !== 'Paycheck') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentUnit'],
          message: compensationFormErrorCodes.INVALID_PAYMENT_UNIT_FOR_FLSA,
        })
      }
      if (rate === undefined || rate < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: compensationFormErrorCodes.RATE_MINIMUM,
        })
      }
    } else {
      if (paymentUnit !== 'Year') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentUnit'],
          message: compensationFormErrorCodes.INVALID_PAYMENT_UNIT_FOR_FLSA,
        })
      }
      if (rate !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rate'],
          message: compensationFormErrorCodes.RATE_MINIMUM,
        })
      }
    }
  })
}
