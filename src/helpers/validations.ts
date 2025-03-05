import * as v from 'valibot'
import { normalizePhone } from '@/helpers/phone'
import { removeNonDigits } from '@/helpers/formattedStrings'

export const NAME_REGEX = /^([a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+)*[.]{0,1}){1,2}$/

export const nameValidation = v.pipe(v.string(), v.nonEmpty(), v.regex(NAME_REGEX))

export const zipValidation = v.pipe(
  v.string(),
  v.check(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)),
)

export const SSN_REGEX = /^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$/

export const phoneValidation = v.pipe(
  v.string(),
  v.transform(normalizePhone),
  v.check(phone => {
    const digits = removeNonDigits(phone)
    return digits.length === 10
  }),
)
