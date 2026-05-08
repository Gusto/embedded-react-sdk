import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.Locations')
  const Components = useComponentContext()

  return (
    <header>
      <Components.Heading as="h2">{t('locationsListTitle')}</Components.Heading>
      <Components.Text>{t('locationsListDescription')}</Components.Text>
    </header>
  )
}
