import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/Common'
import { useCompensation } from '@/components/Employee/Compensation/Compensation'

export const Head = () => {
  const { t } = useTranslation('Employee.Compensation')
  const { showFlsaChangeWarning } = useCompensation()
  return (
    <>
      <h2>{t('title')}</h2>
      {showFlsaChangeWarning && (
        <Alert label={t('validations.classificationChangeNotification')} variant="warning" />
      )}
    </>
  )
}
