import { useTranslation } from 'react-i18next'

export const Head = () => {
  const { t } = useTranslation('Employee.Profile')
  return (
    <>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>
    </>
  )
}
