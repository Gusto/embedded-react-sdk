import * as v from 'valibot'

export const NAME_REGEX = /^([a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+)*[.]{0,1}){1,2}$/

export const nameValidation = v.pipe(v.string(), v.nonEmpty(), v.regex(NAME_REGEX))

export const zipValidation = v.pipe(
  v.string(),
  v.check(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)),
)

export const SSN_REGEX = /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/
