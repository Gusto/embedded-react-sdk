import { useTranslation } from 'react-i18next'
import { useCompensation } from './useCompensation'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Head = () => {
  const { t } = useTranslation('Employee.Compensation')
  const { showFlsaChangeWarning, mode } = useCompensation()
  const Components = useComponentContext()

  let title = t('title')

  if (mode === 'EDIT_ADDITIONAL_JOB') {
    title = t('editTitle')
  }

  if (mode === 'ADD_ADDITIONAL_JOB') {
    title = t('addTitle')
  }

  return (
    <>
      <h2>{title}</h2>
      {showFlsaChangeWarning && (
        <Components.Alert
          label={t('validations.classificationChangeNotification')}
          status="warning"
        />
      )}
    </>
  )
}
