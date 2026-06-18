import { z } from 'zod'

/**
 * Off-cycle payroll reason that drives pay-period date validation rules.
 *
 * @remarks
 * `'bonus'` is used for paying a bonus, gift, or commission. `'correction'` is used for running a correction payment and constrains the start date to today or earlier.
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
  /** Beginning of the pay period; required unless `isCheckOnly` is true, and cannot be in the future when the payroll type is `'correction'`. */
  startDate: Date | null
  /** End of the pay period; required unless `isCheckOnly` is true, and must be on or after `startDate`. */
  endDate: Date | null
  /** Date employees will be paid; must be at least the company's ACH lead time of business days from today for direct deposit, unless `isCheckOnly` is true. */
  checkDate: Date | null
}

/** @internal */
export const createOffCyclePayPeriodDateFormSchema = (
  t: (key: string, options?: Record<string, unknown>) => string,
  payrollType: OffCyclePayrollDateType,
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
