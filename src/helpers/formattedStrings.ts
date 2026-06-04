import DOMPurify from 'dompurify'
import { type Location } from '@gusto/embedded-api-v-2025-11-15/models/components/location'
import { type EmployeeAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeaddress'
import { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase() + word.slice(1)

/**
 * Joins a first and last name into a single capitalized display string.
 *
 * @remarks Each name part is capitalized at its first character. A space is
 * inserted between the parts only when the last name is present. Missing
 * parts are treated as empty.
 *
 * @param name - Object with optional `first_name` and `last_name` fields.
 * @returns The combined name, e.g. `Jane Doe`, `Jane`, or `''`.
 * @internal
 */
export const firstLastName = ({
  first_name,
  last_name,
}: {
  first_name?: string | null
  last_name?: string | null
}) =>
  `${first_name ? capitalize(first_name) : ''}${last_name ? maybeString(capitalize(last_name)) : ''}`

const maybeString = (str: string | null | undefined) => {
  return str ? ` ${str}` : ''
}

/**
 * Combines an address's two street lines with a comma separator.
 *
 * @remarks Each line is prefixed with a leading space when present, producing
 * a string like ` 123 Main St, Apt 4`. Prefer {@link formatStreetForDisplay}
 * for new display code; this function is retained for legacy callers.
 *
 * @param address - Address whose `street1` and `street2` are joined.
 * @returns The joined street string.
 * @internal
 */
export const getStreet = (address: EmployeeAddress | Location) => {
  const street1 = maybeString(address.street1)
  const street2 = maybeString(address.street2)

  return `${street1},${street2}`
}

/**
 * Joins an address's street lines with a comma for display.
 *
 * @remarks Trims each line and skips empty values, avoiding the leading-space
 * and trailing-comma artifacts of {@link getStreet}.
 *
 * @param address - Address whose `street1` and `street2` are joined.
 * @returns The display-formatted street string, e.g. `123 Main St, Apt 4`.
 * @internal
 */
export const formatStreetForDisplay = (address: EmployeeAddress | Location) => {
  const parts = [address.street1?.trim(), address.street2?.trim()].filter((part): part is string =>
    Boolean(part),
  )
  return parts.join(', ')
}

/**
 * Formats an address's city, state, and zip into a single display string.
 *
 * @param address - Address whose `city`, `state`, and `zip` are joined.
 * @returns A `City, State Zip` string. Empty fields are skipped.
 * @internal
 */
export const getCityStateZip = (address: EmployeeAddress | Location) =>
  `${maybeString(address.city)}, ${maybeString(address.state)} ${maybeString(address.zip)}`

/**
 * Formats a full address as a single inline string.
 *
 * @param address - The address to format.
 * @returns The combined street and city/state/zip string.
 * @internal
 */
export const addressInline = (address: EmployeeAddress | Location) =>
  `${getStreet(address)} ${getCityStateZip(address)}`

/**
 * Wraps an amount string with a currency or percent symbol.
 *
 * @param amount - Pre-formatted numeric string.
 * @param isPercentage - When `true`, appends `%`; otherwise prepends `$`.
 * @returns The amount with the appropriate symbol.
 * @internal
 */
const amountStr = (amount: string, isPercentage: boolean) =>
  isPercentage ? `${amount}%` : `$${amount}`

/**
 * Formats a number as a USD currency string with two decimal places.
 *
 * @param amount - The numeric value to format.
 * @param locale - Optional BCP 47 locale tag passed to `toLocaleString`.
 * Defaults to `en-US`.
 * @returns A `$1,234.56` style currency string.
 * @internal
 */
export const formatNumberAsCurrency = (amount: number, locale: string = 'en-US') => {
  const formattedNumber = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amountStr(formattedNumber, false)
}

/**
 * Formats a pay rate with its payment unit, annualizing weekly and monthly values.
 *
 * @remarks Hourly, yearly, and paycheck rates are displayed at the input
 * value. Weekly rates are multiplied by 52 and monthly rates by 12 to express
 * an annualized amount. Unknown payment units render as the currency value
 * alone.
 *
 * @param args - Formatting inputs: `rate` (numeric value), `paymentUnit`
 * (`Hour`, `Week`, `Month`, `Year`, or `Paycheck`), `t` (i18next translation
 * function), and optional `locale` (BCP 47 tag, default `en-US`).
 * @returns The translated, formatted pay rate string.
 * @internal
 */
export const formatPayRate = ({
  rate,
  paymentUnit,
  t,
  locale = 'en-US',
}: {
  rate: number
  paymentUnit: string
  t: TFunction
  locale?: string
}) => {
  const amount = formatNumberAsCurrency(rate, locale)

  switch (paymentUnit) {
    case 'Hour':
      return t('payRateFormats.hourly', { amount, ns: 'common' })
    case 'Week':
      return t('payRateFormats.weekly', {
        amount: formatNumberAsCurrency(rate * 52, locale),
        ns: 'common',
      })
    case 'Month':
      return t('payRateFormats.monthly', {
        amount: formatNumberAsCurrency(rate * 12, locale),
        ns: 'common',
      })
    case 'Year':
      return t('payRateFormats.yearly', { amount, ns: 'common' })
    case 'Paycheck':
      return t('payRateFormats.paycheck', { amount, ns: 'common' })
    default:
      return amount
  }
}

/**
 * Formats a compensation rate as-is, without annualizing weekly or monthly values.
 *
 * @remarks Use for displaying compensation card data where the stored rate
 * should be shown directly (e.g. `$950 per week`, `$3,500 per month`).
 * Unknown payment units render as the currency value alone.
 *
 * @param args - Formatting inputs: `rate` (numeric value), `paymentUnit`
 * (`Hour`, `Week`, `Month`, `Year`, or `Paycheck`), `t` (i18next translation
 * function), and optional `locale` (BCP 47 tag, default `en-US`).
 * @returns The translated, formatted compensation rate string.
 * @internal
 */
export const formatCompensationRate = ({
  rate,
  paymentUnit,
  t,
  locale = 'en-US',
}: {
  rate: number
  paymentUnit: string
  t: TFunction
  locale?: string
}) => {
  const amount = formatNumberAsCurrency(rate, locale)

  switch (paymentUnit) {
    case 'Hour':
      return t('compensationRateFormats.hourly', { amount, ns: 'common' })
    case 'Week':
      return t('compensationRateFormats.weekly', { amount, ns: 'common' })
    case 'Month':
      return t('compensationRateFormats.monthly', { amount, ns: 'common' })
    case 'Year':
      return t('compensationRateFormats.yearly', { amount, ns: 'common' })
    case 'Paycheck':
      return t('compensationRateFormats.paycheck', { amount, ns: 'common' })
    default:
      return amount
  }
}

/**
 * Hook that returns a memoized {@link formatCompensationRate} bound to the active locale.
 *
 * @returns A callback `(rate, paymentUnit) => string`.
 * @internal
 */
export const useFormatCompensationRate = () => {
  const { t } = useTranslation('common')
  const { locale } = useLocale()

  return useCallback(
    (rate: number, paymentUnit: string) => {
      return formatCompensationRate({ rate, paymentUnit, t, locale })
    },
    [t, locale],
  )
}

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['href', 'target'] }
/**
 * Sanitizes an HTML string for use with React's `dangerouslySetInnerHTML`.
 *
 * @remarks Only `<a>`, `<b>`, and `<strong>` tags are allowed, and `<a>`
 * elements may retain only `href` and `target` attributes. All other markup
 * is stripped via DOMPurify.
 *
 * @param dirty - The raw HTML string to sanitize.
 * @returns An object shaped for `dangerouslySetInnerHTML`. The `__html`
 * field is `''` when the input is empty.
 * @internal
 */
export function createMarkup(dirty: string) {
  if (!dirty) return { __html: '' }
  return { __html: DOMPurify.sanitize(dirty, dompurifyConfig) }
}

/**
 * Removes all non-digit characters from a string.
 *
 * @param value - The string to filter.
 * @returns The input with only the digit characters `0`–`9` retained.
 * @internal
 */
export const removeNonDigits = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Strips the trailing `.value` segment from an API error path.
 *
 * @remarks API validation errors target a `.value` field on the inner
 * object, but react-hook-form registers the field under its bare name.
 * Stripping `.value` aligns the error path with the form field name.
 *
 * @param errorKey - The dotted error path returned by the API.
 * @returns The error key without a trailing `.value`.
 * @internal
 */
export const normalizeErrorKeyForForm = (errorKey: string): string =>
  errorKey.replace(/\.value$/, '')

/**
 * Converts a `snake_case` string to `camelCase`.
 *
 * @param s - The snake_case string to convert.
 * @returns The camelCase equivalent.
 * @internal
 */
export const snakeCaseToCamelCase = (s: string) => {
  return s.replace(/_([a-z])/g, (_: string, char: string) => char.toUpperCase())
}

/**
 * Converts a `camelCase` or `PascalCase` string to `snake_case`.
 *
 * @remarks Handles consecutive uppercase letters by inserting a separator
 * before the final letter of a run that is followed by a lowercase letter
 * (e.g. `HTMLParser` becomes `html_parser`).
 *
 * @param s - The camelCase or PascalCase string to convert.
 * @returns The snake_case equivalent in lower case.
 * @internal
 */
export const camelCaseToSnakeCase = (s: string) => {
  return s
    .replace(
      /([a-z0-9])([A-Z])/g,
      (_: string, group1: string, group2: string) => `${group1}_${group2.toLowerCase()}`,
    )
    .replace(
      /([A-Z])([A-Z])(?=[a-z])/g,
      (_: string, group1: string, group2: string) =>
        `${group1.toLowerCase()}_${group2.toLowerCase()}`,
    )
    .toLowerCase()
}

/**
 * Formats a US phone number as `NNN-NNN-NNNN` for display.
 *
 * @remarks Strips non-digit characters before formatting. A leading `1`
 * country code on 11-digit inputs is dropped. Inputs that are not 10 or 11
 * digits are returned as the raw digit string. Returns an empty string for
 * nullish input.
 *
 * @param phoneNumber - The phone number to format.
 * @returns The formatted phone number, the digit-only fallback, or `''`.
 * @internal
 */
export const formatPhoneNumber = (phoneNumber: string | number | null | undefined): string => {
  if (!phoneNumber) return ''

  const digits = removeNonDigits(String(phoneNumber))

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  return digits || ''
}
