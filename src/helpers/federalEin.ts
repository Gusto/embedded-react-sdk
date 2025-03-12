import { useTranslation } from 'react-i18next'

/**
 * Normalizes string input to a 9 digit EIN format with two leading digits, a dash, and 7 trailing digits removing any non-numeric characters.
 * @param value - Raw string value to be formatted as a federal EIN
 * @returns String in the federal EIN format with all invalid characters removed
 */
export const normalizeEin = (value: string) =>
  value
    .match(/\d*/g)
    ?.join('')
    .match(/(\d{0,2})(\d{0,7})/)
    ?.slice(1)
    .filter(match => match !== '')
    .join('-')
    .substring(0, 10) || ''

export const createPlaceholderEin = (hasEin?: boolean, placeholderEin?: string) =>
  hasEin ? placeholderEin : ''

export const usePlaceholderEin = (hasEin?: boolean) => {
  const { t } = useTranslation('common')
  return createPlaceholderEin(hasEin, t('inputs.ein.placeholder'))
}
