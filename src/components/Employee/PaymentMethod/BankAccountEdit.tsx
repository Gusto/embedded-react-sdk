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
  routingNumber: pipe(string(), regex(/^[0-9]{9}$/)),
  accountNumber: pipe(string(), regex(/^[0-9]{9,18}$/)),
  accountType: picklist(['Checking', 'Savings']),
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
        name="routingNumber"
        label={t('routingNumberLabel')}
        isRequired
        description={t('routingNumberDescription')}
        errorMessage={t('validations.routingNumber')}
      />

      <TextField
        control={control}
        name="accountNumber"
        label={t('accountNumberLabel')}
        errorMessage={t('validations.accountNumber')}
        isRequired
      />

      <RadioGroup
        control={control}
        name="accountType"
        label={t('accountTypeLabel')}
        options={[
          { value: 'Checking', label: t('accountTypeChecking') },
          { value: 'Savings', label: t('accountTypeSavings') },
        ]}
      />
    </>
  )
}
