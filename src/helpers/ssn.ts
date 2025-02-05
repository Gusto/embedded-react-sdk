import { useTranslation } from 'react-i18next'

export const normalizeSSN = (value: string) =>
  value
    .match(/\d*/g)
    ?.join('')
    .match(/(\d{0,3})(\d{0,2})(\d{0,4})/)
    ?.slice(1)
    .filter(match => match !== '')
    .join('-')
    .substring(0, 12) || ''

export const createPlaceholderSSN = (hasSSN?: boolean, placeholderSSN?: string) =>
  hasSSN ? placeholderSSN : ''

export const usePlaceholderSSN = (hasSSN?: boolean) => {
  const { t } = useTranslation('common')
  return createPlaceholderSSN(hasSSN, t('inputs.ssn.placeholder'))
}
