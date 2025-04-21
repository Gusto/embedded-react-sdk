import type { InferInput } from 'valibot'
import { minValue, number, object, pipe } from 'valibot'
import { useTranslation } from 'react-i18next'
import { Flex, NumberInputField } from '@/components/Common'

export const BankAccountVerifySchema = object({
  deposit1: pipe(number(), minValue(0)),
  deposit2: pipe(number(), minValue(0)),
})

export type BankAccountVerifyInputs = InferInput<typeof BankAccountVerifySchema>

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
