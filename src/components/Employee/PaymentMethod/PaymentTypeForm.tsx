import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { usePaymentMethod } from './usePaymentMethod'
import { RadioGroupField } from '@/components/Common'

export const PaymentTypeSchema = v.object({
  type: v.picklist(['Check', 'Direct Deposit']),
})
export type PaymentTypeInputs = v.InferInput<typeof PaymentTypeSchema>
export type PaymentTypePayload = v.InferOutput<typeof PaymentTypeSchema>

export enum PAYMENT_METHODS {
  check = 'Check',
  directDeposit = 'Direct Deposit',
}

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
