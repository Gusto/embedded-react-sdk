import { useTranslation } from 'react-i18next'
import { useEmployeeList } from './useEmployeeList'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Employee.EmployeeList')
  const { handleSkip, employees } = useEmployeeList()
  const Components = useComponentContext()

  if (employees.length === 0) {
    return null
  }

  return (
    <ActionsLayout>
      <Components.Button onClick={handleSkip} isLoading={false}>
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
