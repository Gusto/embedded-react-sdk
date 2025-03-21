import DOMPurify from 'dompurify'
import { Location } from '@gusto/embedded-api/models/components/location'
import type { Schemas } from '@/types/schema'

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

export const getStreet = (address: Schemas['Address'] | Location) => {
  //@ts-expect-error: temporary Speakeasy transition
  const street1 = maybeString(address.street_1 ?? address.street1)
  //@ts-expect-error: temporary Speakeasy transition
  const street2 = maybeString(address.street_2 ?? address.street2)

  return `${street1},${street2}`
}

export const getCityStateZip = (address: Schemas['Address'] | Location) =>
  `${maybeString(address.city)}, ${maybeString(address.state)} ${maybeString(address.zip)}`

export const addressInline = (address: Schemas['Address'] | Location) =>
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

const dompurifyConfig = { ALLOWED_TAGS: ['a', 'b', 'strong'], ALLOWED_ATTR: ['href', 'target'] }
export function createMarkup(dirty: string) {
  if (!dirty) return { __html: '' }
  return { __html: DOMPurify.sanitize(dirty, dompurifyConfig) }
}

export const removeNonDigits = (value: string): string => {
  return value.replace(/\D/g, '')
}
