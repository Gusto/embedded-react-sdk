import { useTranslation } from 'react-i18next'

export const Head = () => {
  const { t } = useTranslation('Company.AssignSignatory')

  return (
    <header>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </header>
  )
}
