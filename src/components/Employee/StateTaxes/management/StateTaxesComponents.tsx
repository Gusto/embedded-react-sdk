import { useTranslation } from 'react-i18next'
import { StateTaxesCard } from './StateTaxesCard'
import { StateTaxesEditForm } from './StateTaxesEditForm'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type StateTaxesSuccessAlertCode = 'stateTaxesUpdated'

export interface StateTaxesContextInterface extends FlowContextInterface {
  employeeId?: string
  successAlert?: StateTaxesSuccessAlertCode | null
}

export function StateTaxesCardContextual() {
  const { employeeId, onEvent, successAlert } = useFlow<StateTaxesContextInterface>()
  const { t } = useTranslation('Employee.Management.StateTaxes')
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <StateTaxesCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </Flex>
  )
}

export function StateTaxesEditFormContextual() {
  const { employeeId, onEvent } = useFlow<StateTaxesContextInterface>()
  return <StateTaxesEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
