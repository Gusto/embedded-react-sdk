import { RadioGroup } from '@/components/Common'
import { Radio } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'

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
  const { control } = useFormContext<PaymentTypeInputs>()
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <RadioGroup control={control} name="type" label={t('paymentFieldsetLegend')}>
      <Radio value={PAYMENT_METHODS.directDeposit}>{t('directDepositLabel')}</Radio>
      <Radio value={PAYMENT_METHODS.check}>{t('checkLabel')}</Radio>
    </RadioGroup>
  )
}
