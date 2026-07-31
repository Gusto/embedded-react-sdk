import { useTranslation } from 'react-i18next'
import { AddressEditForm } from './AddressEditForm'
import { AddressCard } from './AddressCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type AddressSuccessAlertCode = 'addressUpdated'

/** @internal */
export interface AddressContextInterface extends FlowContextInterface {
  contractorId?: string
  successAlert?: AddressSuccessAlertCode | null
}

/** @internal */
export function CardContextual() {
  const { contractorId, onEvent, successAlert, LoaderComponent } =
    useFlow<AddressContextInterface>()
  const { t } = useTranslation('Contractor.Management.Address')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <AddressCard
        contractorId={ensureRequired(contractorId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function AddressEditFormContextual() {
  const { contractorId, onEvent, LoaderComponent } = useFlow<AddressContextInterface>()
  return (
    <AddressEditForm
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}
