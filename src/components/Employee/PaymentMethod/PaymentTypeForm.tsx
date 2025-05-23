import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { usePaymentMethod } from './usePaymentMethod'
import { PAYMENT_METHODS } from './Constants'
import { RadioGroupField } from '@/components/Common'

export const PaymentTypeSchema = z.object({
  type: z.enum(['Check', 'Direct Deposit']),
})
export type PaymentTypeInputs = z.input<typeof PaymentTypeSchema>
export type PaymentTypePayload = z.output<typeof PaymentTypeSchema>

export function PaymentTypeForm() {
  const { mode } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  if (mode !== 'INITIAL' && mode !== 'LIST') return
  return (
    <RadioGroupField
      name="type"
      label={t('paymentFieldsetLegend')}
      shouldVisuallyHideLabel
      options={[
        {
          value: PAYMENT_METHODS.directDeposit,
          label: t('directDepositLabel'),
          description: t('directDepositDescription'),
        },
        {
          value: PAYMENT_METHODS.check,
          label: t('checkLabel'),
          description: t('checkDescription'),
        },
      ]}
    />
  )
}
