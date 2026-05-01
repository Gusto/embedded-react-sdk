import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common/Flex/Flex'

export const Head = () => {
  const { t } = useTranslation('Company.Industry')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h2">{t('title')}</Components.Heading>
      <Components.Text variant="supporting">{t('description')}</Components.Text>
    </Flex>
  )
}
