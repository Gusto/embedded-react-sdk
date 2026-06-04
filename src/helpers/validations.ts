import { z } from 'zod'
import { commonMasks, formatWithMask } from './mask'
import { removeNonDigits } from '@/helpers/formattedStrings'

/**
 * Regex matching personal names: one or two words composed of Latin or extended-Latin letters,
 * with optional internal spaces, hyphens, or apostrophes, and an optional trailing period.
 *
 * @internal
 */
export const NAME_REGEX = /^([a-zA-Z\xC0-\uFFFF]+([ \-']{0,1}[a-zA-Z\xC0-\uFFFF]+)*[.]{0,1}){1,2}$/

/**
 * Zod schema validating a non-empty personal name against {@link NAME_REGEX}.
 *
 * @internal
 */
export const nameValidation = z.string().min(1).regex(NAME_REGEX)

/**
 * Zod schema validating a US ZIP code in either 5-digit (`12345`) or ZIP+4 (`12345-6789`) form.
 *
 * @internal
 */
export const zipValidation = z.string().refine(zip => /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip))

/**
 * Regex matching a valid US Social Security Number. Rejects reserved area numbers (000, 666, 9xx),
 * a group number of 00, and a serial number of 0000.
 *
 * @internal
 */
export const SSN_REGEX = /^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$/

/**
 * Zod schema validating a US phone number. Formats the input with the phone mask and accepts it
 * only when the digit-only form is exactly ten digits.
 *
 * @internal
 */
export const phoneValidation = z
  .string()
  .transform(value => formatWithMask(value, commonMasks.phoneMask))
  .refine(phone => {
    const digits = removeNonDigits(phone)
    return digits.length === 10
  })

/**
 * Zod schema validating a bank routing number (exactly nine digits).
 *
 * @internal
 */
export const routingNumberValidation = z.string().regex(/^[0-9]{9}$/)
/**
 * Zod schema validating a bank account number (one to seventeen digits).
 *
 * @internal
 */
export const accountNumberValidation = z.string().regex(/^[0-9]{1,17}$/)
