import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Flex, NumberInputField } from '@/components/Common'

export const BankAccountVerifySchema = z.object({
  deposit1: z.number().min(0),
  deposit2: z.number().min(0),
})

export type BankAccountVerifyInputs = z.infer<typeof BankAccountVerifySchema>

export function Form() {
  const { t } = useTranslation('Company.BankAccount')

  return (
    <Flex flexDirection="column" gap={20}>
      <NumberInputField
        name="deposit1"
        format="currency"
        isRequired
        label={t('deposit1Label')}
        description={t('deposit1Description')}
        errorMessage={t('validations.deposit1')}
      />
      <NumberInputField
        name="deposit2"
        format="currency"
        label={t('deposit2Label')}
        description={t('deposit2Description')}
        isRequired
        errorMessage={t('validations.deposit2')}
      />
    </Flex>
  )
}
