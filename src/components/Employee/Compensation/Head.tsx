import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/Common'

import { useCompensation } from './Compensation'

export const Head = () => {
  const { t } = useTranslation('Employee.Compensation')
  const { showFlsaChangeWarning, mode } = useCompensation()

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
        <Alert label={t('validations.classificationChangeNotification')} variant="warning" />
      )}
    </>
  )
}
