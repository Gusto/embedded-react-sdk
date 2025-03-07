import { useTranslation } from 'react-i18next'
import { useLocationsList } from './LocationsList'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.Locations')
  const { handleEditLocation } = useLocationsList()

  return (
    <ActionsLayout>
      <Button onPress={handleEditLocation} variant="secondary">
        {t('addLocationCTA')}
      </Button>
    </ActionsLayout>
  )
}
