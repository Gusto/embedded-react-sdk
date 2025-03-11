import { useTranslation } from 'react-i18next'
import { useLocationsForm } from './LocationForm'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.Locations')
  const { handleCancel } = useLocationsForm()

  return (
    <ActionsLayout>
      <Button onPress={handleCancel} variant="secondary">
        {t('cancelCta')}
      </Button>
      <Button type="submit" variant="primary">
        {t('saveCta')}
      </Button>
    </ActionsLayout>
  )
}
