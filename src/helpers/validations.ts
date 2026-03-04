import { z } from 'zod'
import { commonMasks, formatWithMask } from './mask'
import { removeNonDigits } from '@/helpers/formattedStrings'
import { ValidationCode } from '@/hooks/UNSTABLE/types'

export const withValidation = <T>(code: string, check: (value: T) => boolean) => {
  return (value: T, ctx: z.RefinementCtx) => {
    if (!check(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: { validation: code },
      })
    }
  }
}

export const NAME_REGEX = /^([a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+)*[.]{0,1}){1,2}$/

export const nameValidation = z.string().min(1).regex(NAME_REGEX)

export const SSN_REGEX = /^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$/

export const zipValidation = z
  .string()
  .superRefine(
    withValidation(ValidationCode.ZipInvalidFormat, (val: string) =>
      /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(val),
    ),
  )

export const phoneValidation = z
  .string()
  .transform(value => formatWithMask(value, commonMasks.phoneMask))
  .superRefine(
    withValidation(ValidationCode.PhoneInvalidFormat, (phone: string) => {
      const digits = removeNonDigits(phone)
      return digits.length === 10
    }),
  )

export const routingNumberValidation = z
  .string()
  .superRefine(
    withValidation(ValidationCode.RoutingNumberInvalidFormat, (val: string) =>
      /^[0-9]{9}$/.test(val),
    ),
  )

export const accountNumberValidation = z
  .string()
  .superRefine(
    withValidation(ValidationCode.AccountNumberInvalidFormat, (val: string) =>
      /^[0-9]{1,17}$/.test(val),
    ),
  )
