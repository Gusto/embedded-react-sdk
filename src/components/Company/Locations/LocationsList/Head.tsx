import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'

export function Head() {
  const { t } = useTranslation('Company.Locations')
  const Components = useComponentContext()

  return (
    <header>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">{t('locationsListTitle')}</Components.Heading>
        <Components.Text variant="supporting">{t('locationsListDescription')}</Components.Text>
      </Flex>
    </header>
  )
}
