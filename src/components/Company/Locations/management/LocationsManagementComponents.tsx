import { useTranslation } from 'react-i18next'
import { LocationsList } from '../LocationsList'
import { Head } from '../LocationsList/Head'
import { List } from '../LocationsList/List'
import { useLocationsList } from '../LocationsList/useLocationsList'
import type { LocationsContextInterface } from '../shared/locationsComponents'
import { ActionsLayout } from '@/components/Common'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Add-only actions for the management address list.
 *
 * @remarks
 * The onboarding list's actions carry Add alongside a Continue that advances the onboarding
 * flow. Here the list is a resting screen with nothing to continue to — the block's back
 * header is the way out — so only Add remains.
 *
 * @internal
 */
function LocationsManagementActions() {
  const { t } = useTranslation('Company.Locations')
  const { handleAddLocation } = useLocationsList()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={handleAddLocation}>
        {t('addLocationCta')}
      </Components.Button>
    </ActionsLayout>
  )
}

/**
 * The steady-state address list.
 *
 * @remarks
 * Composes `LocationsList` with its heading and table, under Add-only actions. Supplying
 * children replaces the list's defaults, which is how the Continue button is dropped.
 *
 * @internal
 */
export function LocationsManagementListContextual() {
  const { companyId, onEvent } = useFlow<LocationsContextInterface>()
  return (
    <LocationsList companyId={ensureRequired(companyId)} onEvent={onEvent}>
      <Head />
      <List />
      <LocationsManagementActions />
    </LocationsList>
  )
}
