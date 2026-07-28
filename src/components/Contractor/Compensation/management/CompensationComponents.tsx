import { useTranslation } from 'react-i18next'
import { CompensationEditForm } from './CompensationEditForm'
import { CompensationCard } from './CompensationCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type CompensationSuccessAlertCode = 'compensationUpdated'

/** @internal */
export interface CompensationContextInterface extends FlowContextInterface {
  contractorId?: string
  successAlert?: CompensationSuccessAlertCode | null
}

/** @internal */
export function CardContextual() {
  const { contractorId, onEvent, successAlert } = useFlow<CompensationContextInterface>()
  const { t } = useTranslation('Contractor.Management.Compensation')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <CompensationCard contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
    </Flex>
  )
}

/** @internal */
export function CompensationEditFormContextual() {
  const { contractorId, onEvent } = useFlow<CompensationContextInterface>()
  return <CompensationEditForm contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}
