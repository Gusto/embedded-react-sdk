import { useTranslation } from 'react-i18next'
import { usePaymentMethod } from './usePaymentMethod'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Employee.PaymentMethod')
  const { mode } = usePaymentMethod()
  const Components = useComponentContext()

  if (mode !== 'INITIAL' && mode !== 'LIST') return
  return (
    <>
      <Components.Heading as="h2">{t('title')}</Components.Heading>
    </>
  )
}
