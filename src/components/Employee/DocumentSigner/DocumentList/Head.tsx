import { useTranslation } from 'react-i18next'

function Head() {
  const { t } = useTranslation('Employee.DocumentSigner')

  return <h2>{t('documentListTitle')}</h2>
}

export { Head }
