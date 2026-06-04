import { useTranslation } from 'react-i18next'

/**
 * Formats an SSN-like input string as `XXX-XX-XXXX`, stripping non-digit characters.
 *
 * Excess digits beyond nine are truncated.
 *
 * @param value - Raw user input that may contain digits, spaces, or punctuation.
 * @returns The dash-formatted SSN, or an empty string if no digits are present.
 * @internal
 */
export const normalizeSSN = (value: string) =>
  value
    .match(/\d*/g)
    ?.join('')
    .match(/(\d{0,3})(\d{0,2})(\d{0,4})/)
    ?.slice(1)
    .filter(match => match !== '')
    .join('-')
    .substring(0, 12) || ''

/**
 * Returns the masked placeholder string when an SSN is already on file, otherwise an empty string.
 *
 * @param hasSSN - Whether the underlying record already has an SSN stored.
 * @param placeholderSSN - The masked placeholder to display when an SSN exists.
 * @returns The placeholder when `hasSSN` is true, otherwise an empty string.
 * @internal
 */
const createPlaceholderSSN = (hasSSN?: boolean, placeholderSSN?: string) =>
  hasSSN ? placeholderSSN : ''

/**
 * Hook that returns the localized SSN placeholder when an SSN is already on file.
 *
 * @param hasSSN - Whether the underlying record already has an SSN stored.
 * @returns The translated placeholder string, or an empty string when no SSN exists.
 * @internal
 */
export const usePlaceholderSSN = (hasSSN?: boolean) => {
  const { t } = useTranslation('common')
  return createPlaceholderSSN(hasSSN, t('inputs.ssn.placeholder'))
}
