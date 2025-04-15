import { useTranslation } from 'react-i18next'
import { usePaymentMethod } from './usePaymentMethod'

export function Head() {
  const { t } = useTranslation('Employee.PaymentMethod')
  const { mode } = usePaymentMethod()
  if (mode !== 'INITIAL' && mode !== 'LIST') return
  return (
    <>
      <h2>{t('title')}</h2>
    </>
  )
}
