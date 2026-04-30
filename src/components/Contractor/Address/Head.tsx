import { useTranslation } from 'react-i18next'
import { useAddress } from './useAddress'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

export function Head() {
  const { t } = useTranslation('Contractor.Address')
  const { contractorType } = useAddress()
  const Components = useComponentContext()

  return (
    <header>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">
          {contractorType === 'Business' ? t('businessAddressTitle') : t('homeAddressTitle')}
        </Components.Heading>
        <Components.Text variant="supporting">
          {contractorType === 'Business'
            ? t('businessAddressDescription')
            : t('homeAddressDescription')}
        </Components.Text>
      </Flex>
    </header>
  )
}
