import { z } from 'zod'

export type OffCyclePayrollDateType = 'bonus' | 'correction'

export interface OffCyclePayPeriodDateFormPresentationProps {
  isCheckOnly: boolean
  onCheckOnlyChange: (value: boolean) => void
}

export interface OffCyclePayPeriodDateFormData {
  isCheckOnly: boolean
  startDate: Date | null
  endDate: Date | null
  checkDate: Date | null
}

export const createOffCyclePayPeriodDateFormSchema = (
  t: (key: string) => string,
  payrollType: OffCyclePayrollDateType,
  minCheckDate: Date,
) => {
  return z
    .object({
      isCheckOnly: z.boolean(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      checkDate: z.date().nullable(),
    })
    .superRefine((data, ctx) => {
      if (!data.isCheckOnly) {
        if (!data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['startDate'],
            message: t('validations.startDateRequired'),
          })
        }

        if (!data.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endDate'],
            message: t('validations.endDateRequired'),
          })
        }

        if (data.startDate && data.endDate && data.endDate < data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endDate'],
            message: t('validations.endDateAfterStart'),
          })
        }

        if (payrollType === 'correction' && data.startDate) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (data.startDate > today) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['startDate'],
              message: t('validations.startDateNotFuture'),
            })
          }
        }
      }

      if (!data.checkDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['checkDate'],
          message: t('validations.checkDateRequired'),
        })
      } else if (!data.isCheckOnly) {
        const checkDateNormalized = new Date(data.checkDate)
        checkDateNormalized.setHours(0, 0, 0, 0)
        const minCheckDateNormalized = new Date(minCheckDate)
        minCheckDateNormalized.setHours(0, 0, 0, 0)

        if (checkDateNormalized < minCheckDateNormalized) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['checkDate'],
            message: t('validations.checkDateAchLeadTime'),
          })
        }
      }
    })
}

export type OffCyclePayPeriodDateFormSchema = ReturnType<
  typeof createOffCyclePayPeriodDateFormSchema
>
