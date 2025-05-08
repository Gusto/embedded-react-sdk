import { useTranslation } from 'react-i18next'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

// Head slot for EmployeeList component
export const Head = () => {
  const { t } = useTranslation('Employee.EmployeeList')
  const Components = useComponentContext()

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Components.Heading as="h2">{t('title')}</Components.Heading>
    </Flex>
  )
}
