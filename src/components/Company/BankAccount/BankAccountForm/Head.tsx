import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

export function Head() {
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">{t('addBankAccountTitle')}</Components.Heading>
      <Components.Text variant="supporting">{t('addBankAccountDescription')}</Components.Text>
    </Flex>
  )
}
