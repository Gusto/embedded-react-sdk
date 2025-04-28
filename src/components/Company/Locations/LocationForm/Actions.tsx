import { useTranslation } from 'react-i18next'
import { useLocationsForm } from './useLocationForm'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Actions = () => {
  const { t } = useTranslation('Company.Locations')
  const { handleCancel, isPending } = useLocationsForm()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={handleCancel}>
        {t('cancelCta')}
      </Components.Button>
      <Components.Button type="submit" isLoading={isPending} data-testid="location-submit">
        {t('saveCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
