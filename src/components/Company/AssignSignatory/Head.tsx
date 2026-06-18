import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

/** @internal */
export const Head = () => {
  const { t } = useTranslation('Company.AssignSignatory')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Heading as="h1">{t('title')}</Components.Heading>
      <Components.Text variant="supporting">{t('description')}</Components.Text>
    </Flex>
  )
}
