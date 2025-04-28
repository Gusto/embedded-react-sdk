import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.StateTaxes')
  const Components = useComponentContext()
  return (
    <div>
      <Components.Alert status="warning" label={t('list.selfOnboardingWarningLabel')}>
        {t('list.selfOnboardingWarningDescription')}
      </Components.Alert>
    </div>
  )
}
