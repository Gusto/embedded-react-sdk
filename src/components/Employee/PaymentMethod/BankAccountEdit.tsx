import { Radio } from 'react-aria-components'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  object,
  pipe,
  string,
  nonEmpty,
  regex,
  picklist,
  type InferNonNullableInput,
  literal,
} from 'valibot'
import { usePaymentMethod } from '@/components/Employee/PaymentMethod/PaymentMethod'
import { PAYMENT_METHODS } from '@/components/Employee/PaymentMethod/PaymentTypeForm'
import { RadioGroup, TextField } from '@/components/Common'

export const BankAccountSchema = object({
  name: pipe(string(), nonEmpty('f')),
  routing_number: pipe(string(), regex(/^[0-9]{9}$/)),
  account_number: pipe(string(), regex(/^[0-9]{9,18}$/)),
  account_type: picklist(['Checking', 'Savings']),
  hasBankPayload: literal(true),
})

export type BankAccountInputs = InferNonNullableInput<typeof BankAccountSchema>
export type BankAccountDefaults = InferNonNullableInput<typeof BankAccountSchema>

export const BankAccountForm = () => {
  const { mode, watchedType } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  const { control, setValue } = useFormContext<BankAccountInputs>()

  if ((mode !== 'ADD' && mode !== 'INITIAL') || watchedType === PAYMENT_METHODS.check) {
    return
  }
  //Used by form schema to determine variant
  setValue('hasBankPayload', true)

  return (
    <>
      <TextField
        name="name"
        control={control}
        isRequired
        label={t('nameLabel')}
        errorMessage={t('validations.accountName')}
      />

      <TextField
        control={control}
        name="routing_number"
        label={t('routingNumberLabel')}
        isRequired
        description={t('routingNumberDescription')}
        errorMessage={t('validations.routingNumber')}
      />

      <TextField
        control={control}
        name="account_number"
        label={t('accountNumberLabel')}
        errorMessage={t('validations.accountNumber')}
        isRequired
      />

      <RadioGroup control={control} name="account_type" label={t('accountTypeLabel')}>
        <Radio value={'Checking'}>{t('accountTypeChecking')}</Radio>
        <Radio value={'Savings'}>{t('accountTypeSavings')}</Radio>
      </RadioGroup>
    </>
  )
}
