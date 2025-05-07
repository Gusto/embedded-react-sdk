import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.DocumentList')
  const Components = useComponentContext()

  return <Components.Heading as="h2">{t('documentListTitle')}</Components.Heading>
}
