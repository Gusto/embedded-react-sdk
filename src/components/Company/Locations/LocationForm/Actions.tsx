import { useTranslation } from 'react-i18next'
import { useLocationsForm } from './useLocationForm'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Actions = () => {
  const { t } = useTranslation('Company.Locations')
  const { handleCancel, isPending } = useLocationsForm()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.ButtonSecondary onClick={handleCancel}>
        {t('cancelCta')}
      </Components.ButtonSecondary>
      <Components.Button type="submit" isLoading={isPending} data-testid="location-submit">
        {t('saveCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
