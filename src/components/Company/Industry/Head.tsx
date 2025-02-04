import { useTranslation } from 'react-i18next'

export const Head = () => {
  const { t } = useTranslation('Company.Industry')
  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
    </div>
  )
}
