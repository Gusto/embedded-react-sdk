import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'
import { Flex, TextInputField } from '@/components/Common'

/** @internal */
export const BankAccountFormSchema = z.object({
  routingNumber: routingNumberValidation,
  accountNumber: accountNumberValidation,
})

/** @internal */
export type BankAccountFormInputs = z.infer<typeof BankAccountFormSchema>

/** @internal */
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
