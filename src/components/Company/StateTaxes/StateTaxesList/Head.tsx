import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/Common'

export function Head() {
  const { t } = useTranslation('Company.StateTaxes')

  return (
    <div>
      <Alert variant="warning" label={t('list.selfOnboardingWarningLabel')}>
        {t('list.selfOnboardingWarningDescription')}
      </Alert>
    </div>
  )
}
