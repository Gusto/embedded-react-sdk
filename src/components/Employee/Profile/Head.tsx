import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Head = () => {
  const { t } = useTranslation('Employee.Profile')
  const Components = useComponentContext()

  return (
    <div>
      <Components.Heading as="h2">{t('title')}</Components.Heading>
      <Components.Text>{t('description')}</Components.Text>
    </div>
  )
}
