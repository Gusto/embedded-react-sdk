import { useTranslation } from 'react-i18next'
import { LocationsCard } from './LocationsCard'
import { LocationsEditScreen } from './LocationsEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type LocationsSuccessAlertCode = 'locationsUpdated'

/** @internal */
export interface LocationsBlockContextInterface extends FlowContextInterface {
  companyId?: string
  successAlert?: LocationsSuccessAlertCode | null
  /**
   * Set while the user is still inside the address sub-flow, and promoted to `successAlert`
   * only once they leave it — a save must not announce itself by ejecting them mid-task.
   */
  pendingAlert?: LocationsSuccessAlertCode | null
}

/** @internal */
export function LocationsCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } =
    useFlow<LocationsBlockContextInterface>()
  const { t } = useTranslation('Company.Management.Locations')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_LOCATIONS_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <LocationsCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function LocationsEditScreenContextual() {
  const { companyId, onEvent } = useFlow<LocationsBlockContextInterface>()
  return <LocationsEditScreen companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
