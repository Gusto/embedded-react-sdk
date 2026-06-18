import { useTranslation } from 'react-i18next'
import { RadioGroupField } from '@/components/Common'
import { PAYMENT_METHODS } from '@/shared/constants'

/** @internal */
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
