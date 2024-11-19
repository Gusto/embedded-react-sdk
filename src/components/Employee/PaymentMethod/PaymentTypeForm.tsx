import { RadioGroup } from '@/components/Common'
import { usePaymentMethod } from '@/components/Employee/PaymentMethod/PaymentMethod'
import { Radio, Text } from 'react-aria-components'
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
  const { mode } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  if (mode !== 'INITIAL' && mode !== 'LIST') return
  return (
    <RadioGroup control={control} name="type" aria-label={t('paymentFieldsetLegend')}>
      <Radio value={PAYMENT_METHODS.directDeposit}>
        <div>
          {t('directDepositLabel')}
          <Text slot="description">{t('directDepositDescription')}</Text>
        </div>
      </Radio>
      <Radio value={PAYMENT_METHODS.check}>
        <div>
          {t('checkLabel')}
          <Text slot="description">{t('checkDescription')}</Text>
        </div>
      </Radio>
    </RadioGroup>
  )
}
