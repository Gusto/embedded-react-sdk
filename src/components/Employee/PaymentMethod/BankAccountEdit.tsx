import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { BankAccountInputs } from './BankAccount'
import { usePaymentMethod } from './usePaymentMethod'
import { PAYMENT_METHODS } from '@/components/Employee/PaymentMethod/PaymentTypeForm'
import { RadioGroup, TextField } from '@/components/Common'

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
