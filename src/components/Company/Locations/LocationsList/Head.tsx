import { useTranslation } from 'react-i18next'

export function Head() {
  const { t } = useTranslation('Company.Locations')

  return (
    <header>
      <h2>{t('locationsListTitle')}</h2>
      <p>{t('locationsListDescription')}</p>
    </header>
  )
}
