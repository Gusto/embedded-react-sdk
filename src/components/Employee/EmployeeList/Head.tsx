import { Flex } from '@/components/Common'
import { useTranslation } from 'react-i18next'

// Head slot for EmployeeList component
export function Head() {
  const { t } = useTranslation('Employee.EmployeeList')
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <h2>{t('title')}</h2>
    </Flex>
  )
}
