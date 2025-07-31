import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Employee.Taxes')
  const Components = useComponentContext()

  return (
    <>
      <Components.Heading as="h1">{t('stateTaxesTitle')}</Components.Heading>
      <Components.Text>{t('selectWithholdingDescription')}</Components.Text>
    </>
  )
}
