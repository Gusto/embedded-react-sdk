import { useTranslation } from 'react-i18next'

export function Head() {
  const { t } = useTranslation('Company.DocumentSigner')

  return <h2>{t('documentListTitle')}</h2>
}
