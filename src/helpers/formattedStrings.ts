import type { Schemas } from '@/types/schema'

export const firstLastName = ({ first_name, last_name }: Schemas['Employee']) =>
  `${first_name} ${last_name}`

const maybeString = (str: string | null | undefined) => {
  return str ? ` ${str}` : ''
}

export const addressInline = (address: Schemas['Address']) =>
  `${maybeString(address.street_1)},${maybeString(address.street_2)} ${maybeString(address.city)}, ${maybeString(address.state)} ${maybeString(address.zip)}`

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
