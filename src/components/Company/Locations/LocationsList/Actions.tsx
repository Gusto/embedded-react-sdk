import { useTranslation } from 'react-i18next'
import { useLocationsList } from './useLocationsList'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export function Actions() {
  const { t } = useTranslation('Company.Locations')
  const { handleAddLocation, handleContinue } = useLocationsList()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={handleAddLocation}>
        {t('addLocationCta')}
      </Components.Button>
      <Components.Button onClick={handleContinue}>{t('continueCta')}</Components.Button>
    </ActionsLayout>
  )
}
