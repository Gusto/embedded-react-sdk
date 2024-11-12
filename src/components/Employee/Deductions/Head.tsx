import { useDeductions } from './Deductions'
import { useTranslation } from 'react-i18next'

export function Head() {
  const { t } = useTranslation('Employee.Deductions')
  const { mode } = useDeductions()
  if (mode !== 'INITIAL' && mode !== 'LIST') return
  return (
    <>
      <h2>{t('pageTitle')}</h2>
    </>
  )
}
