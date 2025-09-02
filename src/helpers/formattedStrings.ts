import DOMPurify from 'dompurify'
import { type Location } from '@gusto/embedded-api/models/components/location'
import { type EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase() + word.slice(1)

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

export const getStreet = (address: EmployeeAddress | Location) => {
  const street1 = maybeString(address.street1)
  const street2 = maybeString(address.street2)

  return `${street1},${street2}`
}

export const getCityStateZip = (address: EmployeeAddress | Location) =>
  `${maybeString(address.city)}, ${maybeString(address.state)} ${maybeString(address.zip)}`

export const addressInline = (address: EmployeeAddress | Location) =>
  `${getStreet(address)} ${getCityStateZip(address)}`

export const currentDateString = () => {
  const d = new Date()
  const dateString = `${String(d.getFullYear())}-${('0' + String(d.getMonth() + 1)).slice(-2)}-${('0' + String(d.getDate())).slice(-2)}`
  return dateString
}

export function isNumberKey({ which, keyCode }: KeyboardEvent) {
  const charCode = which ? which : keyCode
  if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) return false
  return true
}

export const booleanToString = (value: boolean) => (value ? 'true' : 'false')

export const amountStr = (amount: string, isPercentage: boolean) =>
  isPercentage ? `${amount}%` : `$${amount}`

export const formatNumberAsCurrency = (amount: number, locale: string = 'en-US') => {
  const formattedNumber = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amountStr(formattedNumber, false)
}

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

export const useFormatPayRate = () => {
  const { t } = useTranslation('common')
  const { locale } = useLocale()

  return useCallback(
    (rate: number, paymentUnit: string) => {
      return formatPayRate({ rate, paymentUnit, t, locale })
    },
    [t, locale],
  )
}

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['href', 'target'] }
export function createMarkup(dirty: string) {
  if (!dirty) return { __html: '' }
  return { __html: DOMPurify.sanitize(dirty, dompurifyConfig) }
}

export const removeNonDigits = (value: string): string => {
  return value.replace(/\D/g, '')
}

export const snakeCaseToCamelCase = (s: string) => {
  return s.replace(/_([a-z])/g, (_: string, char: string) => char.toUpperCase())
}

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
