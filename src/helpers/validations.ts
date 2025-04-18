import { check, nonEmpty, pipe, regex, string, transform } from 'valibot'
import { normalizePhone } from '@/helpers/phone'
import { removeNonDigits } from '@/helpers/formattedStrings'

export const NAME_REGEX = /^([a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+)*[.]{0,1}){1,2}$/

export const nameValidation = pipe(string(), nonEmpty(), regex(NAME_REGEX))

export const zipValidation = pipe(
  string(),
  check(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)),
)

export const SSN_REGEX = /^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$/

export const phoneValidation = pipe(
  string(),
  transform(normalizePhone),
  check(phone => {
    const digits = removeNonDigits(phone)
    return digits.length === 10
  }),
)

export const routingNumberValidation = pipe(string(), regex(/^[0-9]{9}$/))
export const accountNumberValidation = pipe(string(), regex(/^[0-9]{9,18}$/))
