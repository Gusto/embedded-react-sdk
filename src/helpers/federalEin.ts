import { useTranslation } from 'react-i18next'

/**
 * Normalizes a raw string to the federal EIN display format `NN-NNNNNNN`.
 *
 * @remarks Strips non-numeric characters, then inserts a dash between the
 * first two digits and the remaining seven. Returns an empty string when no
 * digits are present.
 *
 * @param value - Raw string value to be formatted as a federal EIN.
 * @returns A string in `NN-NNNNNNN` format with non-digit characters removed.
 * @internal
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

/**
 * Returns the placeholder EIN to display when an EIN exists but is masked.
 *
 * @param hasEin - Whether the form currently has a stored EIN value.
 * @param placeholderEin - The masked placeholder string to show.
 * @returns The placeholder string when `hasEin` is true; otherwise an empty string.
 * @internal
 */
const createPlaceholderEin = (hasEin?: boolean, placeholderEin?: string) =>
  hasEin ? placeholderEin : ''

/**
 * Hook that returns a translated placeholder string for a masked EIN field.
 *
 * @param hasEin - Whether the form currently has a stored EIN value.
 * @returns The translated placeholder when `hasEin` is true; otherwise an empty string.
 * @internal
 */
export const usePlaceholderEin = (hasEin?: boolean) => {
  const { t } = useTranslation('common')
  return createPlaceholderEin(hasEin, t('inputs.ein.placeholder'))
}
