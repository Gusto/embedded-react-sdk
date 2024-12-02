import { usePaymentMethod } from '@/components/Employee/PaymentMethod/PaymentMethod'
import { useTranslation } from 'react-i18next'

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
