export const removeNonDigits = (value: string): string => {
  return value.replace(/\D/g, '')
}

export const normalizePhone = (value: string): string => {
  const digits = removeNonDigits(value)

  if (!digits.length) return ''

  // Format: (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return `(${digits}`
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}
