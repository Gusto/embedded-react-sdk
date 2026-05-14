import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { CombinedSchemaInputs } from './paymentMethodSchema'
import { RadioGroupField, TextInputField } from '@/components/Common'

export function BankAccountFormFields() {
  const { t } = useTranslation('Employee.PaymentMethod')
  const { setValue } = useFormContext<CombinedSchemaInputs>()

  useEffect(() => {
    setValue('hasBankPayload', true)
  }, [setValue])

  return (
    <>
      <TextInputField
        name="name"
        isRequired
        label={t('nameLabel')}
        errorMessage={t('validations.accountName')}
      />
      <TextInputField
        name="routingNumber"
        label={t('routingNumberLabel')}
        isRequired
        description={t('routingNumberDescription')}
        errorMessage={t('validations.routingNumber')}
      />
      <TextInputField
        name="accountNumber"
        label={t('accountNumberLabel')}
        errorMessage={t('validations.accountNumber')}
        isRequired
      />
      <RadioGroupField
        name="accountType"
        isRequired
        label={t('accountTypeLabel')}
        options={[
          { value: 'Checking', label: t('accountTypeChecking') },
          { value: 'Savings', label: t('accountTypeSavings') },
        ]}
      />
    </>
  )
}
