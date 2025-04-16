import { useTranslation } from 'react-i18next'
import { useLocationsList } from './useLocationsList'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.Locations')
  const { handleAddLocation, handleContinue } = useLocationsList()

  return (
    <ActionsLayout>
      <Button onPress={handleAddLocation} variant="secondary">
        {t('addLocationCta')}
      </Button>
      <Button onPress={handleContinue} variant="primary">
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
