import { useTranslation } from 'react-i18next'

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
