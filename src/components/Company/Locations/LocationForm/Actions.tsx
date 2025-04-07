import { useTranslation } from 'react-i18next'
import { useLocationsForm } from './LocationForm'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Company.Locations')
  const { handleCancel, isPending } = useLocationsForm()

  return (
    <ActionsLayout>
      <Button onPress={handleCancel} variant="secondary" isLoading={isPending}>
        {t('cancelCta')}
      </Button>
      <Button type="submit" variant="primary" isLoading={isPending} data-testid="location-submit">
        {t('saveCta')}
      </Button>
    </ActionsLayout>
  )
}
