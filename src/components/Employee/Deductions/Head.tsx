import { useTranslation } from 'react-i18next'
import { useDeductions } from './Deductions'

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
