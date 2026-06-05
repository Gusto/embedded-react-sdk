import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import { CompensationCard } from './CompensationCard'
import { CompensationEditForm } from './CompensationEditForm'
import { CompensationAddJobForm } from './CompensationAddJobForm'
import { CompensationAddAnotherJobForm } from './CompensationAddAnotherJobForm/CompensationAddAnotherJobForm'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

export type CompensationSuccessAlertCode = 'jobAdded'

export interface CompensationContextInterface extends FlowContextInterface {
  employeeId?: string
  /** Set when transitioning to `editCompensation` via the card EDIT event;
   *  consumed by `CompensationEditFormContextual` to target the right job. */
  currentJob?: Job | null
  successAlert?: CompensationSuccessAlertCode | null
}

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

export function CompensationEditFormContextual() {
  const { employeeId, currentJob, onEvent } = useFlow<CompensationContextInterface>()
  return (
    <CompensationEditForm
      employeeId={ensureRequired(employeeId)}
      job={ensureRequired(currentJob ?? undefined)}
      onEvent={onEvent}
      onCancel={() => {
        onEvent(componentEvents.CANCEL, null)
      }}
    />
  )
}

export function CompensationAddJobFormContextual() {
  const { employeeId, onEvent } = useFlow<CompensationContextInterface>()
  return (
    <CompensationAddJobForm
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
    />
  )
}

export function CompensationAddAnotherJobFormContextual() {
  const { employeeId, onEvent } = useFlow<CompensationContextInterface>()
  return (
    <CompensationAddAnotherJobForm
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
    />
  )
}
