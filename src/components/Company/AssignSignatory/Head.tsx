import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Head = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const Components = useComponentContext()

  return (
    <header>
      <Components.Heading as="h1">{t('title')}</Components.Heading>
      <p>{t('description')}</p>
    </header>
  )
}
