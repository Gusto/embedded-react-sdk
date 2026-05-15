import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function Head() {
  const { t } = useTranslation('Employee.DocumentSigner')
  const Components = useComponentContext()

  return <Components.Heading as="h2">{t('documentListTitle')}</Components.Heading>
}

export { Head }
