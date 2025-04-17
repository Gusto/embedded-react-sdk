import * as v from 'valibot'
import { useTranslation } from 'react-i18next'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'
import { Flex, TextInputField } from '@/components/Common'

export const BankAccountFormSchema = v.object({
  routingNumber: routingNumberValidation,
  accountNumber: accountNumberValidation,
})

export type BankAccountFormInputs = v.InferInput<typeof BankAccountFormSchema>

export function Form() {
  const { t } = useTranslation('Company.BankAccount')

  return (
    <Flex flexDirection="column" gap={20}>
      <TextInputField
        name="routingNumber"
        isRequired
        label={t('form.routingNumberLabel')}
        description={t('form.routingNumberDescription')}
        errorMessage={t('validations.routingNumber')}
      />
      <TextInputField
        name="accountNumber"
        label={t('form.accountNumberLabel')}
        isRequired
        errorMessage={t('validations.accountNumber')}
      />
    </Flex>
  )
}
