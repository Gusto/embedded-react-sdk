import type { Transform } from '@/components/Common/Fields/hooks/useField'

/**
 * Formats a string according to a specified mask pattern.
 * @param value - The input string to format
 * @param mask - The mask pattern where:
 *   # represents a digit (\d)
 *   @ represents a letter ([a-zA-Z])
 *   ^ represents an uppercase letter ([A-Z])
 *   % represents a digit or uppercase letter ([0-9A-Z])
 *   any other character represents the literal character
 * @returns The formatted string according to the mask
 * @example
 * formatWithMask('123456789', '###-##-####') // returns '123-45-6789'
 * formatWithMask('ABC123', '@@@-###') // returns 'ABC-123'
 * formatWithMask('123456', '(###) ###-####') // returns '(123) 456'
 * formatWithMask('ABC123', '^^^-###') // returns 'ABC-123'
 * formatWithMask('A1B2C3', '%%%-%%%') // returns 'A1B-2C3'
 */
export const formatWithMask = (value: string, mask: string | null): string => {
  if (!value || !mask) return value

  // Remove all non-alphanumeric characters from the input
  const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '')
  if (!sanitizedValue) return ''

  let result = ''
  let valueIndex = 0
  let maskIndex = 0

  while (maskIndex < mask.length) {
    const maskChar = mask.charAt(maskIndex)
    const valueChar = sanitizedValue.charAt(valueIndex)

    // If we've processed all input characters, stop
    if (valueIndex >= sanitizedValue.length) {
      break
    }

    switch (maskChar) {
      case '#':
        if (/\d/.test(valueChar)) {
          result += valueChar
          valueIndex++
        } else {
          valueIndex++
          maskIndex--
        }
        break
      case '@':
        if (/[a-zA-Z]/.test(valueChar)) {
          result += valueChar
          valueIndex++
        } else {
          valueIndex++
          maskIndex--
        }
        break
      case '^':
        if (/[A-Z]/.test(valueChar)) {
          result += valueChar
          valueIndex++
        } else {
          valueIndex++
          maskIndex--
        }
        break
      case '%':
        if (/[0-9A-Z]/.test(valueChar)) {
          result += valueChar
          valueIndex++
        } else {
          valueIndex++
          maskIndex--
        }
        break
      default:
        // Always add literal characters from the mask
        result += maskChar
        // Increment valueIndex only if the current input character matches the literal mask character.
        if (maskChar === valueChar) {
          valueIndex++
        }
    }
    maskIndex++
  }

  return result.trim()
}

export const useMaskedTransform = (mask: string | null): Transform<string> => {
  return (value: string) => formatWithMask(value, mask)
}

export const commonMasks = {
  phoneMask: '(###) ###-####',
}
