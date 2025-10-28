import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { usePaymentMethod } from './usePaymentMethod'
import { RadioGroupField } from '@/components/Common'
import { PAYMENT_METHODS } from '@/shared/constants'

export const PaymentTypeSchema = z.object({
  type: z.enum(['Check', 'Direct Deposit']),
})
export type PaymentTypeInputs = z.input<typeof PaymentTypeSchema>
export type PaymentTypePayload = z.output<typeof PaymentTypeSchema>

export function PaymentTypeForm() {
  const { mode, isAdmin } = usePaymentMethod()
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
          description: isAdmin ? t('directDepositDescription') : t('directDepositDescriptionSelf'),
        },
        {
          value: PAYMENT_METHODS.check,
          label: t('checkLabel'),
          description: isAdmin ? t('checkDescription') : t('checkDescriptionSelf'),
        },
      ]}
    />
  )
}
