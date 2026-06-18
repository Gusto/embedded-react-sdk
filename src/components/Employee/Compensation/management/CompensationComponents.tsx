import { useTranslation } from 'react-i18next'
import { CompensationCard } from './CompensationCard'
import { CompensationEditForm } from './CompensationEditForm'
import { CompensationAddJobForm } from './CompensationAddJobForm'
import { CompensationAddAnotherJobForm } from './CompensationAddAnotherJobForm/CompensationAddAnotherJobForm'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type CompensationSuccessAlertCode = 'jobAdded'

/** @internal */
export interface CompensationContextInterface extends FlowContextInterface {
  employeeId?: string
  /** Set when transitioning to `editCompensation` via the card EDIT event;
   *  consumed by `CompensationEditFormContextual` to target the right job. */
  currentJobId?: string | null
  successAlert?: CompensationSuccessAlertCode | null
}

/** @internal */
export function CompensationCardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<CompensationContextInterface>()
  const { t } = useTranslation('Employee.Management.Compensation')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <CompensationCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </Flex>
  )
}

/** @internal */
export function CompensationEditFormContextual() {
  const { employeeId, currentJobId, onEvent } = useFlow<CompensationContextInterface>()
  return (
    <CompensationEditForm
      employeeId={ensureRequired(employeeId)}
      jobId={ensureRequired(currentJobId ?? undefined)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function CompensationAddJobFormContextual() {
  const { employeeId, onEvent } = useFlow<CompensationContextInterface>()
  return <CompensationAddJobForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function CompensationAddAnotherJobFormContextual() {
  const { employeeId, onEvent } = useFlow<CompensationContextInterface>()
  return <CompensationAddAnotherJobForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
