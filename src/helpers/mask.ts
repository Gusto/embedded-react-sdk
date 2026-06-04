import type { Transform } from '@/components/Common/Fields/hooks/useField'

/**
 * Formats a string according to a specified mask pattern.
 *
 * @remarks
 * Strips non-alphanumeric characters from the input before applying the mask.
 * Mask pattern characters:
 * - `#` matches a digit (`\d`)
 * - `@` matches a letter (`[a-zA-Z]`)
 * - `^` matches an uppercase letter (`[A-Z]`)
 * - `%` matches a digit or uppercase letter (`[0-9A-Z]`)
 * - any other character is emitted as a literal
 *
 * @param value - The input string to format
 * @param mask - The mask pattern, or `null` to pass the value through unchanged
 * @returns The formatted string according to the mask, or the original value when `value` or `mask` is empty
 * @internal
 *
 * @example
 * ```ts
 * formatWithMask('123456789', '###-##-####') // '123-45-6789'
 * formatWithMask('ABC123', '@@@-###')        // 'ABC-123'
 * formatWithMask('123456', '(###) ###-####') // '(123) 456'
 * formatWithMask('ABC123', '^^^-###')        // 'ABC-123'
 * formatWithMask('A1B2C3', '%%%-%%%')        // 'A1B-2C3'
 * ```
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

/**
 * Builds a Field transform that applies a mask pattern to the input value on each change.
 *
 * @param mask - The mask pattern accepted by {@link formatWithMask}, or `null` to pass the value through unchanged
 * @returns A transform function suitable for passing to a Field component's `transform` prop
 * @internal
 */
export const useMaskedTransform = (mask: string | null): Transform<string> => {
  return (value: string) => formatWithMask(value, mask)
}

/**
 * Reusable mask patterns shared across Field components.
 *
 * @internal
 */
export const commonMasks = {
  phoneMask: '(###) ###-####',
}
