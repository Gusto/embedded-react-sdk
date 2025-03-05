import { useTranslation } from 'react-i18next'
import { Flex } from '@/components/Common'

// Head slot for EmployeeList component
export const Head = () => {
  const { t } = useTranslation('Employee.EmployeeList')
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <h2>{t('title')}</h2>
    </Flex>
  )
}
