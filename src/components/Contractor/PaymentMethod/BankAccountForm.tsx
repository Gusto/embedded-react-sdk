import { useTranslation } from 'react-i18next'
import type { BankAccountFormProps } from './types'
import { Flex, RadioGroupField, TextInputField } from '@/components/Common'

export function BankAccountForm({ bankAccount }: BankAccountFormProps) {
  const { t } = useTranslation('Contractor.PaymentMethod', { keyPrefix: 'bankAccountForm' })

  return (
    <Flex gap={20} flexDirection={'column'}>
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
    </Flex>
  )
}
