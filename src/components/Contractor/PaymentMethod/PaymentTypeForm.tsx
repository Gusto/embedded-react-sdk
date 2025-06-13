import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { RadioGroupField } from '@/components/Common'
import { PAYMENT_METHODS } from '@/shared/constants'

export const PaymentTypeSchema = z.object({
  type: z.enum(['Check', 'Direct Deposit']),
})
export type PaymentTypeInputs = z.input<typeof PaymentTypeSchema>
export type PaymentTypePayload = z.output<typeof PaymentTypeSchema>

export function PaymentTypeForm() {
  const { t } = useTranslation('Contractor.PaymentMethod')
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
