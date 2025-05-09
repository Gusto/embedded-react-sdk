import { useTranslation } from 'react-i18next'
import { useDeductions } from './useDeductions'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Employee.Deductions')
  const { mode } = useDeductions()
  const Components = useComponentContext()

  if (mode !== 'INITIAL' && mode !== 'LIST') return
  return (
    <>
      <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
    </>
  )
}
