import { useTranslation } from 'react-i18next'
import { PayScheduleForm } from '../PayScheduleForm'
import type { PayScheduleDefaultValues } from '../PaySchedule'
import { PayScheduleOverview } from './PayScheduleOverview'
import { PayScheduleAssignment } from './PayScheduleAssignment'
import { Flex } from '@/components/Common/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

/** @internal */
export type PayScheduleManagementSuccessAlertCode = 'assignmentUpdated'

/** @internal */
export interface PayScheduleManagementContextInterface extends FlowContextInterface {
  companyId: string
  payScheduleId?: string
  defaultValues?: PayScheduleDefaultValues
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
  successAlert?: PayScheduleManagementSuccessAlertCode | null
  component: React.ComponentType | null
}

/** @internal */
export function PayScheduleOverviewContextual() {
  const { companyId, onEvent, enableAutoPilot, enableMultipleSchedules, successAlert } =
    useFlow<PayScheduleManagementContextInterface>()
  const { t } = useTranslation('Company.Management.PaySchedule')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.PAY_SCHEDULE_MANAGEMENT_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <PayScheduleOverview
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
      />
    </Flex>
  )
}

/** @internal */
export function PayScheduleAssignmentContextual() {
  const { companyId, onEvent } = useFlow<PayScheduleManagementContextInterface>()

  return <PayScheduleAssignment companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function PayScheduleEditFormContextual() {
  const { companyId, payScheduleId, defaultValues, onEvent } =
    useFlow<PayScheduleManagementContextInterface>()

  return (
    <PayScheduleForm
      companyId={ensureRequired(companyId)}
      payScheduleId={payScheduleId}
      defaultValues={defaultValues}
      onEvent={onEvent}
    />
  )
}
