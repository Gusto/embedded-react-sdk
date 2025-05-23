import { z } from 'zod'
import { commonMasks, formatWithMask } from './mask'
import { removeNonDigits } from '@/helpers/formattedStrings'

export const NAME_REGEX = /^([a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+)*[.]{0,1}){1,2}$/

export const nameValidation = z.string().min(1, 'Should not be empty').regex(NAME_REGEX)

export const zipValidation = z.string().refine(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip))

export const SSN_REGEX = /^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$/

export const phoneValidation = z
  .string()
  .transform(value => formatWithMask(value, commonMasks.phoneMask))
  .refine(phone => {
    const digits = removeNonDigits(phone)
    return digits.length === 10
  })

export const routingNumberValidation = z.string().regex(/^[0-9]{9}$/)
export const accountNumberValidation = z.string().regex(/^[0-9]{9,18}$/)
