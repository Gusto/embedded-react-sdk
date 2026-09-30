import { z } from 'zod'

/**
 * Off-cycle payroll reason, used to pick default withholding/deduction settings.
 *
 * @remarks
 * `'bonus'` is used for paying a bonus, gift, or commission. `'correction'` is used for running a
 * correction payment. Legacy gws-flows treats both identically for pay-period date validation --
 * see `createOffCyclePayPeriodDateFormSchema`, which no longer branches on this type.
 *
 * @public
 */
export type OffCyclePayrollDateType = 'bonus' | 'correction'

/**
 * Pay-period date selections collected for an off-cycle payroll.
 *
 * @public
 */
export interface OffCyclePayPeriodDateFormData {
  /** When true, all employees are paid by check rather than direct deposit; start and end dates become optional and the check date may be today or any future date. */
  isCheckOnly: boolean
  /** Beginning of the pay period; required unless `isCheckOnly` is true, and must be on or before `endDate`. */
  startDate: Date | null
  /** End of the pay period; required unless `isCheckOnly` is true, and must be on or after `startDate`. */
  endDate: Date | null
  /** Date employees will be paid; must be at least the company's ACH lead time of business days from today for direct deposit, unless `isCheckOnly` is true. */
  checkDate: Date | null
}

/** @internal */
export const createOffCyclePayPeriodDateFormSchema = (
  t: (key: string, options?: Record<string, unknown>) => string,
  minCheckDate: Date,
  paymentSpeedDays?: number,
) => {
  return z
    .object({
      isCheckOnly: z.boolean(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      checkDate: z.date().nullable(),
    })
    .superRefine((data, ctx) => {
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

      if (!data.checkDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['checkDate'],
          message: t('validations.checkDateRequired'),
        })
      } else {
        const checkDateNormalized = new Date(data.checkDate)
        checkDateNormalized.setHours(0, 0, 0, 0)
        const minCheckDateNormalized = new Date(minCheckDate)
        minCheckDateNormalized.setHours(0, 0, 0, 0)

        if (checkDateNormalized < minCheckDateNormalized) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['checkDate'],
            message: data.isCheckOnly
              ? t('validations.checkDateNotPast')
              : t('validations.checkDateAchLeadTime', { count: paymentSpeedDays ?? 2 }),
          })
        }
      }
    })
}
